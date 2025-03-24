import { api } from "@/api/axiosInstance";
import { queryOptions } from "@tanstack/react-query";

export const categoriesApi = {
	fetchFeaturedCategories: async () => {
		const res = await api.get("/categories/featured");
		return res.data;
	},
};

export const fetchCategoriesQueryOptions = () =>
	queryOptions({
		queryKey: ["categories"],
		queryFn: () => categoriesApi.fetchFeaturedCategories(),
		staleTime: Number.POSITIVE_INFINITY,
	});
