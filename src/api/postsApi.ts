import { api } from "@/api/axiosInstance";

export const postsApi = {
	fetchPostList: async ({ pageParam }: { pageParam: number }) => {
		const res = await api.get(`/posts?limit=10&page=${pageParam}`);
		return res.data;
	},
};
