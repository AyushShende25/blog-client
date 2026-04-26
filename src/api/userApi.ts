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

type GetUsersResponse = {
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

type GetFollowersResponse = {
	followers: { username: string }[];
};

type GetFollowingResponse = {
	following: { username: string }[];
};

export const userApi = {
	getAll: async (params: GetUsersFilters): Promise<GetUsersResponse> => {
		const res = await axiosInstance.get<GetUsersResponse>("/users", {
			params,
		});
		return res.data;
	},
	followers: async (userId: string, params: GetFollowsParams) => {
		const res = await axiosInstance.get<GetFollowersResponse>(
			`/users/${userId}/followers`,
			{ params },
		);
		return res.data.followers;
	},
	following: async (userId: string, params: GetFollowsParams) => {
		const res = await axiosInstance.get<GetFollowingResponse>(
			`/users/${userId}/following`,
			{ params },
		);
		return res.data.following;
	},
	updateMe: async (input: UpdateMeInput): Promise<User> => {
		const res = await axiosInstance.patch<UserResponse>("/users/me", input);
		return res.data.user;
	},
	deleteMe: async (): Promise<void> => {
		await axiosInstance.delete("/users/me");
	},
	update: async (userId: string, input: UpdateUserInput): Promise<User> => {
		const res = await axiosInstance.patch<UserResponse>(
			`/users/${userId}`,
			input,
		);
		return res.data.user;
	},
	delete: async (userId: string): Promise<void> => {
		await axiosInstance.delete(`/users/${userId}`);
	},
	follow: async (userId: string): Promise<string> => {
		const res = await axiosInstance.post<MsgResponse>(
			`/users/${userId}/follow`,
		);
		return res.data.message;
	},
	unfollow: async (userId: string): Promise<string> => {
		const res = await axiosInstance.delete<MsgResponse>(
			`/users/${userId}/follow`,
		);
		return res.data.message;
	},
};

export const userKeys = {
	all: ["users"] as const,
	list: (params: GetUsersFilters) => [...userKeys.all, params] as const,
	user: (userId: string) => [...userKeys.all, userId] as const,
	followers: (userId: string, params: GetFollowsParams) =>
		[...userKeys.user(userId), "followers", params] as const,
	following: (userId: string, params: GetFollowsParams) =>
		[...userKeys.user(userId), "following", params] as const,
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

export function useUpdateMe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.updateMe,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.me });
			toast.success("Updated user data");
		},
		onError: handleApiError,
	});
}

export function useDeleteMe() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.deleteMe,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.me });
			toast.success("Removed user account");
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
			queryClient.invalidateQueries({ queryKey: userKeys.all });
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
			queryClient.invalidateQueries({ queryKey: userKeys.all });
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
			await userApi.updateMe({ avatar: fileUrl });
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: authKeys.me });
			toast.success("Updated user data");
		},
		onError: handleApiError,
	});
}

export function useFollow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.follow,
		onSuccess: (_data, userId) => {
			queryClient.invalidateQueries({
				queryKey: userKeys.user(userId),
			});
		},
		onError: handleApiError,
	});
}

export function useUnfollow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: userApi.unfollow,
		onSuccess: (_data, userId) => {
			queryClient.invalidateQueries({ queryKey: userKeys.user(userId) });
		},
		onError: handleApiError,
	});
}
