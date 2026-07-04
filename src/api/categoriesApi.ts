import { queryOptions } from "@tanstack/react-query";
import { axiosInstance } from "@/api/axiosInstance";
import { QueryStaleTime } from "@/constants";
import type { Category } from "@/constants/types";

export type CategoryListResponse = { categories: Category[] };

export type CategoryResponse = { category: Category };

export type CreateCategoryInput = {
	name: string;
};
export type UpdateCategoryInput = {
	name: string;
};

export const categoriesApi = {
	fetchAllCategories: async (): Promise<CategoryListResponse> => {
		const res = await axiosInstance.get<CategoryListResponse>("/categories");
		return res.data;
	},
	createCategory: async (
		input: CreateCategoryInput,
	): Promise<CategoryResponse> => {
		const res = await axiosInstance.post<CategoryResponse>(
			"/categories",
			input,
		);
		return res.data;
	},
	updateCategory: async (
		id: string,
		input: UpdateCategoryInput,
	): Promise<CategoryResponse> => {
		const res = await axiosInstance.patch<CategoryResponse>(
			`/categories/${id}`,
			input,
		);
		return res.data;
	},
	deleteCategory: async (id: string): Promise<void> => {
		await axiosInstance.delete(`/categories/${id}`);
	},
};

export const categoryKeys = {
	all: ["categories"] as const,
};

export const fetchCategoriesQueryOptions = () =>
	queryOptions({
		queryKey: categoryKeys.all,
		queryFn: categoriesApi.fetchAllCategories,
		staleTime: QueryStaleTime,
	});
