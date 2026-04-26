import type { Tag } from "@/constants/types";
import { axiosInstance } from "./axiosInstance";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { QueryStaleTime } from "@/constants";
import { handleApiError } from "@/lib/utils";
import { toast } from "sonner";

type TagsResponse = {
	tags: Tag[];
};

type TagResponse = {
	tag: Tag;
};

type CreateTagInput = { name: string };
type UpdateTagInput = { name: string };

export const tagsApi = {
	fetchAllTags: async (search?: string): Promise<Tag[]> => {
		const res = await axiosInstance.get<TagsResponse>("/tags", {
			params: { search },
		});
		return res.data.tags;
	},
	createTag: async (input: CreateTagInput): Promise<Tag> => {
		const res = await axiosInstance.post<TagResponse>("/tags", input);
		return res.data.tag;
	},
	updateTag: async (id: string, input: UpdateTagInput): Promise<Tag> => {
		const res = await axiosInstance.patch<TagResponse>(`/tags/${id}`, input);
		return res.data.tag;
	},
	deleteTag: async (id: string): Promise<void> => {
		await axiosInstance.delete(`/tags/${id}`);
	},
};

export const tagKeys = {
	all: ["tags"] as const,
	list: (search?: string) => [...tagKeys.all, { search }] as const,
};

export const fetchTagsQueryOptions = (search?: string) =>
	queryOptions({
		queryKey: tagKeys.list(search),
		queryFn: () => tagsApi.fetchAllTags(search),
		staleTime: QueryStaleTime,
	});

export function useCreateTag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: CreateTagInput) => tagsApi.createTag(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			toast.success("Tag created");
		},
		onError: handleApiError,
	});
}

export function useUpdateTag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagInput }) =>
			tagsApi.updateTag(tagId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			toast.success("Tag updated");
		},
		onError: handleApiError,
	});
}

export function useDeleteTag() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (tagId: string) => tagsApi.deleteTag(tagId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: tagKeys.all });
			toast.success("Tag deleted successfully");
		},
		onError: handleApiError,
	});
}
