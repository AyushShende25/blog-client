import { queryOptions } from "@tanstack/react-query";

import { api } from "@/api/axiosInstance";

export const categoriesApi = {
	fetchFeaturedCategories: async () => {
		const res = await api.get("/categories/featured");
		return res.data;
	},
	fetchAllCategories: async () => {
		const res = await api.get("/categories");
		return res.data;
	},
};

export const fetchFeaturedCategoriesQueryOptions = () =>
	queryOptions({
		queryKey: ["categories", "featured"],
		queryFn: () => categoriesApi.fetchFeaturedCategories(),
		staleTime: Number.POSITIVE_INFINITY,
	});

export const fetchCategoriesQueryOptions = () =>
	queryOptions({
		queryKey: ["categories"],
		queryFn: () => categoriesApi.fetchAllCategories(),
		staleTime: Number.POSITIVE_INFINITY,
	});
