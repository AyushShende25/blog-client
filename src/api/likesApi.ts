import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { axiosInstance } from "./axiosInstance";
import { QueryStaleTime } from "@/constants";
import { handleApiError } from "@/lib/utils";

type LikesCountResponse = {
	count: number;
};

type LikeCreateResponse = {
	like: string;
};

type CheckLikeStatusResponse = {
	hasLiked: boolean;
};

export const likesApi = {
	getPostLikesCount: async (postId: string) => {
		const res = await axiosInstance.get<LikesCountResponse>(
			`/likes/post/${postId}/count`,
		);
		return res.data;
	},
	checkStatus: async (postId: string) => {
		const res = await axiosInstance.get<CheckLikeStatusResponse>(
			`/likes/post/${postId}/liked`,
		);
		return res.data;
	},
	remove: async (postId: string) => {
		await axiosInstance.delete(`/likes/post/${postId}`);
	},
	create: async (postId: string) => {
		const res = await axiosInstance.post<LikeCreateResponse>(
			`/likes/post/${postId}`,
		);
		return res.data;
	},
};

export const likeKeys = {
	count: (postId: string) => ["likes", "post", postId] as const,
	status: (postId: string) => ["likes", "status", "post", postId] as const,
};

export const fetchLikesCountQueryOptions = (postId: string) =>
	queryOptions({
		queryKey: likeKeys.count(postId),
		queryFn: () => likesApi.getPostLikesCount(postId),
		staleTime: QueryStaleTime,
	});

export const fetchLikeStatusQueryOptions = (postId: string) =>
	queryOptions({
		queryKey: likeKeys.status(postId),
		queryFn: () => likesApi.checkStatus(postId),
		staleTime: QueryStaleTime,
	});

export function useCreateLike() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId: string) => likesApi.create(postId),
		onSuccess: (_data, postId) => {
			queryClient.invalidateQueries({ queryKey: likeKeys.count(postId) });
			queryClient.invalidateQueries({ queryKey: likeKeys.status(postId) });
		},
		onError: handleApiError,
	});
}

export function useRemoveLike() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId: string) => likesApi.remove(postId),
		onSuccess: (_data, postId) => {
			queryClient.invalidateQueries({ queryKey: likeKeys.count(postId) });
			queryClient.invalidateQueries({ queryKey: likeKeys.status(postId) });
		},
		onError: handleApiError,
	});
}
