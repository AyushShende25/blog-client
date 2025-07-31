import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { fetchCategoriesQueryOptions } from "@/api/categoriesApi";
import { postsApi } from "@/api/postsApi";
import { userQueryOptions } from "@/api/userApi";
import MultiSelect from "@/components/MultiSelect";
import PostForm from "@/components/PostForm";
import Tiptap from "@/components/Tiptap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPostSchema } from "@/constants/schema";
import type { ApiErrorResponse, Category } from "@/constants/types";

export const Route = createFileRoute("/_layout/new-post")({
	component: NewPost,
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(userQueryOptions());
		if (!user) {
			throw redirect({ to: "/login" });
		}
	},
});

function NewPost() {
	return <PostForm mode="create" />;
}
