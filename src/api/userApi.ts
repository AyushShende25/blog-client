import { queryOptions } from "@tanstack/react-query";

import { api } from "@/api/axiosInstance";
import type { User } from "@/constants/types";

export const userApi = {
	getMe: async (): Promise<User | null> => {
		try {
			const res = await api.get("/users/me");
			return res.data.data;
		} catch (error) {
			return null;
		}
	},
	fetchSavedPosts: async () => {
		const res = await api.get("/users/saved");
		return res.data;
	},
	savePost: async (postId: string) => {
		const res = await api.post(`/users/saved/${postId}`);
		return res.data;
	},
	unsavePost: async (postId: string) => {
		const res = await api.delete(`/users/saved/${postId}`);
		return res.data;
	},

	updateUserAvatar: async (avatarUrl: string) => {
		const res = await api.post("/users/update-avatar", { avatarUrl });
		return res.data;
	},
};

export const fetchSavedPostsQueryOptions = (enabled = true) =>
	queryOptions({
		queryKey: ["saved", "user", "posts"],
		queryFn: userApi.fetchSavedPosts,
		staleTime: Number.POSITIVE_INFINITY,
		enabled,
	});

export const userQueryOptions = () =>
	queryOptions({
		queryKey: ["user"],
		queryFn: userApi.getMe,
		staleTime: Number.POSITIVE_INFINITY,
		retry: false,
	});
