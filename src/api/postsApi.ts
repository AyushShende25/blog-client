import {
	infiniteQueryOptions,
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { axiosInstance } from "@/api/axiosInstance";
import type { Post, PostStatus } from "@/constants/types";
import { QueryStaleTime } from "@/constants";
import { toast } from "sonner";
import { handleApiError } from "@/lib/utils";

type FetchPostsFilters = {
	category?: string;
	tag?: string;
	search?: string;
	sort?: string;
	limit?: number;
};

type FetchPostsParams = FetchPostsFilters & {
	page: number;
	dateFrom?: Date;
	dateTo?: Date;
};

type CreatePostInput = {
	title: string;
	content?: string;
	status: PostStatus;
	categoryIds: string[];
	tagIds: string[];
	mediaIds?: string[];
	coverImage?: string | null;
};

type UpdatePostInput = {
	title?: string;
	content?: string;
	status?: PostStatus;
	categoryIds?: string[];
	tagIds?: string[];
	mediaIds?: string[];
	coverImage?: string | null;
};

type PostListResponse = {
	posts: Post[];
	meta: {
		totalPages: number;
		page: number;
		limit: number;
		totalItems: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
};

type PostResponse = {
	post: Post;
};

type CreatePostResponse = PostResponse & {
	message: string;
};

type BookmarkListResponse = {
	posts: Post[];
};

type BookmarkPostResponse = {
	message: string;
	postId: string;
};

type UserPostStatsResponse = {
	stats: {
		publishedPosts: number;
		likesReceived: number;
		commentsReceived: number;
	};
};

export const postsApi = {
	fetchPosts: async (params: FetchPostsParams): Promise<PostListResponse> => {
		const res = await axiosInstance.get<PostListResponse>("/posts/", {
			params: {
				...params,
				dateFrom: params.dateFrom?.toISOString(),
				dateTo: params.dateTo?.toISOString(),
			},
		});
		return res.data;
	},
	fetchPost: async (slug: string): Promise<PostResponse> => {
		const res = await axiosInstance.get<PostResponse>(`/posts/slug/${slug}`);
		return res.data;
	},
	fetchUserPosts: async (username: string): Promise<PostListResponse> => {
		const res = await axiosInstance.get<PostListResponse>(
			`/posts/author/${username}`,
		);
		return res.data;
	},
	createPost: async (input: CreatePostInput): Promise<PostResponse> => {
		const res = await axiosInstance.post<CreatePostResponse>("/posts", input);
		return res.data;
	},
	fetchMyPosts: async (
		params: FetchPostsParams & { status?: PostStatus },
	): Promise<PostListResponse> => {
		const res = await axiosInstance.get<PostListResponse>(`/posts/me`, {
			params: {
				...params,
				dateFrom: params.dateFrom?.toISOString(),
				dateTo: params.dateTo?.toISOString(),
			},
		});
		return res.data;
	},
	fetchBookmarks: async (): Promise<BookmarkListResponse> => {
		const res =
			await axiosInstance.get<BookmarkListResponse>(`/posts/me/bookmarks`);
		return res.data;
	},
	bookmarkPost: async (postId: string): Promise<BookmarkPostResponse> => {
		const res = await axiosInstance.put<BookmarkPostResponse>(
			`/posts/${postId}/bookmark`,
		);
		return res.data;
	},
	unbookmarkPost: async (postId: string): Promise<BookmarkPostResponse> => {
		const res = await axiosInstance.delete<BookmarkPostResponse>(
			`/posts/${postId}/bookmark`,
		);
		return res.data;
	},
	deletePost: async (postId: string): Promise<void> => {
		await axiosInstance.delete(`/posts/${postId}`);
	},
	fetchPostById: async (postId: string): Promise<PostResponse> => {
		const res = await axiosInstance.get<PostResponse>(`/posts/${postId}`);
		return res.data;
	},
	updatePost: async (
		postId: string,
		input: UpdatePostInput,
	): Promise<PostResponse> => {
		const res = await axiosInstance.patch<PostResponse>(
			`/posts/${postId}`,
			input,
		);
		return res.data;
	},
	userStats: async () => {
		const res =
			await axiosInstance.get<UserPostStatsResponse>("/posts/me/stats");
		return res.data;
	},
};

export const postKeys = {
	all: ["posts"] as const,

	published: () => [...postKeys.all, "published"] as const,

	publishedList: (filters: FetchPostsFilters) =>
		[...postKeys.published(), filters] as const,

	user: (username: string) => [...postKeys.all, "user", username] as const,

	me: () => [...postKeys.all, "me"] as const,

	myPosts: (filters: FetchPostsFilters & { status?: PostStatus }) =>
		[...postKeys.me(), "list", filters] as const,

	userStats: () => [...postKeys.me(), "stats"] as const,

	bookmarks: () => [...postKeys.all, "bookmarks"] as const,

	post: (slug: string) => [...postKeys.all, "detail", slug] as const,

	postById: (id: string) => [...postKeys.all, "by-id", id] as const,
};

export const fetchPostsQueryOptions = ({
	category,
	tag,
	search,
	sort = "createdAt:desc",
	limit = 10,
}: FetchPostsFilters) =>
	infiniteQueryOptions({
		queryKey: postKeys.publishedList({ category, tag, search, sort, limit }),
		queryFn: ({ pageParam = 1 }) =>
			postsApi.fetchPosts({
				page: pageParam,
				limit,
				category,
				tag,
				search,
				sort,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
		staleTime: QueryStaleTime,
	});

export const fetchPostQueryOptions = (slug: string) =>
	queryOptions({
		queryKey: postKeys.post(slug),
		queryFn: () => postsApi.fetchPost(slug),
		staleTime: QueryStaleTime,
		enabled: !!slug,
	});

export const fetchPostByIdQueryOptions = (postId: string) =>
	queryOptions({
		queryKey: postKeys.postById(postId),
		queryFn: () => postsApi.fetchPostById(postId),
		staleTime: QueryStaleTime,
	});

export const fetchUserPostsQueryOptions = (username: string) =>
	queryOptions({
		queryKey: postKeys.user(username),
		queryFn: () => postsApi.fetchUserPosts(username),
		staleTime: QueryStaleTime,
		enabled: !!username,
	});

export const fetchMyPostsQueryOptions = ({
	status,
	search,
	category,
	tag,
	sort = "createdAt:desc",
	limit = 10,
}: FetchPostsFilters & { status?: PostStatus }) =>
	infiniteQueryOptions({
		queryKey: postKeys.myPosts({ status, search, category, tag, sort, limit }),
		queryFn: ({ pageParam = 1 }) =>
			postsApi.fetchMyPosts({
				page: pageParam,
				limit,
				status,
				search,
				category,
				tag,
				sort,
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage) =>
			lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
		staleTime: QueryStaleTime,
	});

export const fetchBookmarksQueryOptions = () =>
	queryOptions({
		queryKey: postKeys.bookmarks(),
		queryFn: () => postsApi.fetchBookmarks(),
		staleTime: QueryStaleTime,
	});

export const fetchUserPostStatsQueryOptions = () =>
	queryOptions({
		queryKey: postKeys.userStats(),
		queryFn: () => postsApi.userStats(),
		staleTime: QueryStaleTime,
	});

export function useCreatePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: postsApi.createPost,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: postKeys.all,
			});
		},
		onError: handleApiError,
	});
}

export function useBookmarkPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: postsApi.bookmarkPost,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: postKeys.bookmarks(),
			});
			toast.success("Post added to bookmarks");
		},
		onError: handleApiError,
	});
}

export function useUnBookmarkPost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: postsApi.unbookmarkPost,
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: postKeys.bookmarks(),
			});
			toast.success("Post removed from bookmarks");
		},
		onError: handleApiError,
	});
}

export function useUpdatePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			postId,
			input,
		}: {
			postId: string;
			input: UpdatePostInput;
		}) => postsApi.updatePost(postId, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.all });
		},
		onError: handleApiError,
	});
}

export function useDeletePost() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (postId: string) => postsApi.deletePost(postId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: postKeys.all });
			toast.success("Post deleted successfully");
		},
		onError: handleApiError,
	});
}
