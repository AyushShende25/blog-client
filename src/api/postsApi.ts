import axios from "axios";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import type { CreatePostInput } from "@/constants/types";
import { api } from "@/api/axiosInstance";

export const postsApi = {
	fetchPostList: async ({
		pageParam,
		filter,
		sort,
		category,
	}: {
		pageParam: number;
		filter?: string;
		sort?: string;
		category?: string;
	}) => {
		const res = await api.get(
			`/posts?limit=10&page=${pageParam}&filter=${filter}&category=${category}&sort=${sort}`,
		);
		return res.data;
	},

	fetchPost: async (postSlug: string) => {
		const res = await api.get(`/posts/${postSlug}`);
		return res.data;
	},

	getPresignedUrl: async (filename: string, filetype: string) => {
		const res = await api.post("/posts/generate-presigned-url", {
			filename,
			filetype,
		});
		return res.data;
	},

	uploadToS3: async (signedUrl: string, file: File) => {
		await axios.put(signedUrl, file, {
			headers: { "Content-Type": file.type },
		});
	},

	createPost: async (createPostInput: CreatePostInput) => {
		const res = await api.post("/posts", createPostInput);
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
