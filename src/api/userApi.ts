import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { axiosInstance } from "@/api/axiosInstance";
import type { Platform, Role, UserStatus, User } from "@/constants/types";
import { MEDIA_USAGE } from "@/constants/types";
import { toast } from "sonner";
import { putToS3 } from "./mediaApi";
import { handleApiError } from "@/lib/utils";
import { authKeys } from "./authApi";
import { QueryStaleTime } from "@/constants";
import { postKeys } from "./postsApi";
import { useNavigate } from "@tanstack/react-router";
import { commentKeys } from "./commentsApi";

type UpdateMeInput = {
	bio?: string;
	avatar?: string;
	username?: string;
	socialLinks?: {
		platform: Platform;
		link: string;
	}[];
};

type UserResponse = {
	user: User;
};

type GetUsersFilters = {
	page: number;
	limit: number;
	sort?: string;
	search?: string;
	status?: UserStatus;
	includeDeleted?: boolean;
};

type UserListResponse = {
	users: User[];
	meta: {
		page: number;
		limit: number;
		totalPages: number;
		totalItems: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
};

type UpdateUserInput = {
	isVerified?: boolean;
	bio?: string;
	avatar?: string;
	username?: string;
	socialLinks?: {
		platform: Platform;
		link: string;
	}[];
	role?: Role;
	status?: UserStatus;
};

type MsgResponse = {
	message: string;
};

type GetFollowsParams = {
	page: number;
	limit: number;
};

type FollowersResponse = {
	followers: { username: string }[];
};

type FollowingResponse = {
	following: { username: string }[];
};

type StatsResponse = {
	posts: number;
	followers: number;
	following: number;
};

export const userApi = {
	getAll: async (params: GetUsersFilters): Promise<UserListResponse> => {
		const res = await axiosInstance.get<UserListResponse>("/users", {
			params,
		});
		return res.data;
	},
	followers: async (
		userId: string,
		params: GetFollowsParams,
	): Promise<FollowersResponse> => {
		const res = await axiosInstance.get<FollowersResponse>(
			`/users/${userId}/followers`,
			{ params },
		);
		return res.data;
	},
	following: async (
		userId: string,
		params: GetFollowsParams,
	): Promise<FollowingResponse> => {
		const res = await axiosInstance.get<FollowingResponse>(
			`/users/${userId}/following`,
			{ params },
		);
		return res.data;
	},
	updateMe: async (input: UpdateMeInput): Promise<UserResponse> => {
		const res = await axiosInstance.patch<UserResponse>("/users/me", input);
		return res.data;
	},
	deleteMe: async (): Promise<void> => {
		await axiosInstance.delete("/users/me");
	},
	update: async (
		userId: string,
		input: UpdateUserInput,
	): Promise<UserResponse> => {
		const res = await axiosInstance.patch<UserResponse>(
			`/users/${userId}`,
			input,
		);
		return res.data;
	},
	delete: async (userId: string): Promise<void> => {
		await axiosInstance.delete(`/users/${userId}`);
	},
	follow: async (userId: string): Promise<MsgResponse> => {
		const res = await axiosInstance.post<MsgResponse>(
			`/users/${userId}/follow`,
		);
		return res.data;
	},
	unfollow: async (userId: string): Promise<MsgResponse> => {
		const res = await axiosInstance.delete<MsgResponse>(
			`/users/${userId}/follow`,
		);
		return res.data;
	},
	checkFollowing: async (userId: string): Promise<{ isFollowing: boolean }> => {
		const res = await axiosInstance.get<{ isFollowing: boolean }>(
			`/users/${userId}/is-following`,
		);
		return res.data;
	},
	stats: async (userId: string): Promise<StatsResponse> => {
		const res = await axiosInstance.get<StatsResponse>(
			`/users/${userId}/stats`,
		);
		return res.data;
	},
};

export const userKeys = {
	all: ["users"] as const,

	lists: () => [...userKeys.all, "list"] as const,

	list: (params: GetUsersFilters) => [...userKeys.lists(), params] as const,

	details: () => [...userKeys.all, "detail"] as const,

	user: (userId: string) => [...userKeys.details(), userId] as const,

	followers: (userId: string, params: GetFollowsParams) =>
		[...userKeys.user(userId), "followers", params] as const,

	following: (userId: string, params: GetFollowsParams) =>
		[...userKeys.user(userId), "following", params] as const,

	isFollowing: (userId: string) =>
		[...userKeys.user(userId), "is-following"] as const,

	stats: (userId: string) => [...userKeys.user(userId), "stats"] as const,
};

export const fetchUsersQueryOptions = (params: GetUsersFilters) =>
	queryOptions({
		queryKey: userKeys.list(params),
		queryFn: () => userApi.getAll(params),
		staleTime: QueryStaleTime,
	});

export const fetchFollowersQueryOptions = ({
	userId,
	params,
}: {
	userId: string;
	params: GetFollowsParams;
}) =>
	queryOptions({
		queryKey: userKeys.followers(userId, params),
		queryFn: () => userApi.followers(userId, params),
		staleTime: QueryStaleTime,
	});

export const fetchFollowingQueryOptions = ({
	userId,
	params,
}: {
	userId: string;
	params: GetFollowsParams;
}) =>
	queryOptions({
		queryKey: userKeys.following(userId, params),
		queryFn: () => userApi.following(userId, params),
		staleTime: QueryStaleTime,
	});

export const fetchIsFollowingQueryOptions = ({ userId }: { userId: string }) =>
	queryOptions({
		queryKey: userKeys.isFollowing(userId),
		queryFn: () => userApi.checkFollowing(userId),
		staleTime: QueryStaleTime,
	});

export const fetchUserStatsQueryOptions = ({ userId }: { userId: string }) =>
	queryOptions({
		queryKey: userKeys.stats(userId),
		queryFn: () => userApi.stats(userId),
		staleTime: QueryStaleTime,
	});

export function useUpdateMe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.updateMe,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: authKeys.me,
			});

			queryClient.invalidateQueries({
				queryKey: postKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: userKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: commentKeys.all,
			});

			toast.success("Updated user data");
		},
		onError: handleApiError,
	});
}

export function useDeleteMe() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: userApi.deleteMe,
		onSuccess: async () => {
			queryClient.clear();

			toast.success("Removed user account");

			await navigate({
				to: "/",
			});
		},
		onError: handleApiError,
	});
}

export function useUpdateUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			userId,
			input,
		}: {
			userId: string;
			input: UpdateUserInput;
		}) => userApi.update(userId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: userKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: postKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: commentKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: authKeys.me,
			});
			toast.success("Updated user data");
		},
		onError: handleApiError,
	});
}

export function useDeleteUser() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.delete,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: userKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: postKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: commentKeys.all,
			});
			toast.success("Removed user account");
		},
		onError: handleApiError,
	});
}

export function useUpdateAvatar() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (file: File) => {
			const fileUrl = await putToS3(file, MEDIA_USAGE.AVATAR);
			return userApi.updateMe({ avatar: fileUrl });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: authKeys.me,
			});

			queryClient.invalidateQueries({
				queryKey: postKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: userKeys.all,
			});

			queryClient.invalidateQueries({
				queryKey: commentKeys.all,
			});

			toast.success("Updated user data");
		},
		onError: handleApiError,
	});
}

export function useFollow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.follow,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: userKeys.all,
			});
		},
		onError: handleApiError,
	});
}

export function useUnfollow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.unfollow,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: userKeys.all,
			});
		},
		onError: handleApiError,
	});
}
