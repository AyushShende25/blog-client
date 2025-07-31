import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { api } from "@/api/axiosInstance";
import type { CreatePostInput, POST_STATUS, Post } from "@/constants/types";

interface PostListResponse {
	data: Post[];
	meta: {
		totalPages: number;
		page: number;
		limit: number;
		totalItems: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

interface PostListParams {
	pageParam: number;
	filter?: string;
	sort?: string;
	category?: string;
}

export const postsApi = {
	fetchPostList: async ({
		pageParam,
		filter,
		sort,
		category,
	}: PostListParams): Promise<PostListResponse> => {
		const query = new URLSearchParams({
			limit: "10",
			page: String(pageParam),
			...(filter && { filter }),
			...(sort && { sort }),
			...(category && { category }),
		}).toString();

		const res = await api.get(`/posts?${query}`);
		return res.data;
	},

	fetchPost: async (postSlug: string) => {
		const res = await api.get(`/posts/slug/${postSlug}`);
		return res.data;
	},

	createPost: async (createPostInput: CreatePostInput) => {
		const res = await api.post("/posts", createPostInput);
		return res.data;
	},

	fetchUserPosts: async (status: POST_STATUS) => {
		const res = await api.get(`/posts/user?status=${status}`);
		return res.data;
	},

	deletePost: async (postId: string) => {
		const res = await api.delete(`/posts/id/${postId}`);
		return res.data;
	},

	updatePost: async (postId: string, updateValue: CreatePostInput) => {
		const res = await api.patch(`/posts/id/${postId}`, updateValue);
		return res.data;
	},

	getPostById: async (postId: string) => {
		const res = await api.get(`/posts/id/${postId}`);
		return res.data;
	},
};

export const fetchPostListQueryOptions = (
	category = "",
	filter = "",
	sort = "",
) =>
	infiniteQueryOptions({
		queryKey: ["posts", category, sort, filter],
		queryFn: ({ pageParam }) =>
			postsApi.fetchPostList({ pageParam, category, sort, filter }),
		initialPageParam: 1,
		getNextPageParam: (lastPage, _allPages, lastPageParam) => {
			if (lastPageParam >= lastPage.meta.totalPages) {
				return undefined;
			}
			return lastPageParam + 1;
		},
		staleTime: Number.POSITIVE_INFINITY,
	});

export const fetchPostQueryOptions = (postSlug: string) =>
	queryOptions({
		queryKey: ["post", postSlug],
		queryFn: () => postsApi.fetchPost(postSlug),
		staleTime: Number.POSITIVE_INFINITY,
	});

export const fetchUserPostsQueryOptions = (status: POST_STATUS) =>
	queryOptions({
		queryKey: ["posts", "user", { status }],
		queryFn: () => postsApi.fetchUserPosts(status),
		staleTime: Number.POSITIVE_INFINITY,
	});

export const fetchpostByIdQueryOptions = (postId: string) => ({
	queryKey: ["post", postId],
	queryFn: () => postsApi.getPostById(postId),
});
