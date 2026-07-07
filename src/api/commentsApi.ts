import { axiosInstance } from "./axiosInstance";
import { QueryStaleTime } from "@/constants";
import type { Comment } from "@/constants/types";
import { handleApiError } from "@/lib/utils";
import {
	infiniteQueryOptions,
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { postKeys } from "./postsApi";

type FetchCommentsParams = {
	page?: number;
	limit?: number;
};
type CommentCreate = {
	content: string;
	parentId?: string;
};

type CommentResponse = {
	comment: Comment;
};

type PaginationMeta = {
	page: number;
	limit: number;
	totalPages: number;
	totalThreads: number;
	totalComments: number;
	hasNextPage: boolean;
	hasPreviousPage?: boolean;
};

type CommentsListResponse = {
	comments: Comment[];
	meta: PaginationMeta;
};

type CommentsCountResponse = {
	count: {
		totalComments: number;
		totalThreads: number;
	};
};

export const commentsApi = {
	fetchPostComments: async (
		postId: string,
		params?: FetchCommentsParams,
	): Promise<CommentsListResponse> => {
		const res = await axiosInstance.get<CommentsListResponse>(
			`/comments/post/${postId}`,
			{
				params,
			},
		);
		return res.data;
	},
	fetchCount: async (postId: string) => {
		const res = await axiosInstance.get<CommentsCountResponse>(
			`/comments/post/${postId}/count`,
		);
		return res.data;
	},
	create: async (
		postId: string,
		input: CommentCreate,
	): Promise<CommentResponse> => {
		const res = await axiosInstance.post<CommentResponse>(
			`/comments/post/${postId}`,
			input,
		);
		return res.data;
	},
	update: async (commentId: string, content: string) => {
		const res = await axiosInstance.patch<CommentResponse>(
			`/comments/${commentId}`,
			{ content },
		);
		return res.data;
	},

	remove: async (commentId: string) => {
		await axiosInstance.delete(`/comments/${commentId}`);
	},
};

export const commentKeys = {
	all: ["comments"] as const,
	post: (postId: string) => [...commentKeys.all, "post", postId] as const,
	list: (postId: string, limit?: number) =>
		[...commentKeys.post(postId), "list", limit ?? null] as const,
	count: (postId: string) => [...commentKeys.post(postId), "count"] as const,
};

const DEFAULT_LIMIT = 20;

export const fetchPostCommentsQueryOptions = (
	postId: string,
	params?: FetchCommentsParams,
) =>
	infiniteQueryOptions({
		queryKey: commentKeys.list(postId, params?.limit),
		queryFn: ({ pageParam = 1 }) =>
			commentsApi.fetchPostComments(postId, {
				page: pageParam,
				limit: params?.limit ?? DEFAULT_LIMIT,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined;
		},
		staleTime: QueryStaleTime,
	});

export const fetchPostCommentsCountQueryOptions = (postId: string) =>
	queryOptions({
		queryKey: commentKeys.count(postId),
		queryFn: () => commentsApi.fetchCount(postId),
		staleTime: QueryStaleTime,
	});

export function useCreateComment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ postId, input }: { postId: string; input: CommentCreate }) =>
			commentsApi.create(postId, input),
		onSuccess: (_data, { postId }) => {
			queryClient.invalidateQueries({
				queryKey: commentKeys.post(postId),
			});
			queryClient.invalidateQueries({
				queryKey: postKeys.published(),
			});
		},
		onError: handleApiError,
	});
}

export function useUpdateComment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			commentId,
			content,
		}: {
			commentId: string;
			postId: string;
			content: string;
		}) => commentsApi.update(commentId, content),
		onSuccess: (_data, { postId }) => {
			queryClient.invalidateQueries({
				queryKey: commentKeys.post(postId),
			});
		},
		onError: handleApiError,
	});
}

export function useDeleteComment() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ commentId }: { commentId: string; postId: string }) =>
			commentsApi.remove(commentId),

		onSuccess: (_data, { postId }) => {
			queryClient.invalidateQueries({
				queryKey: commentKeys.post(postId),
			});
			queryClient.invalidateQueries({
				queryKey: postKeys.published(),
			});
		},

		onError: handleApiError,
	});
}
