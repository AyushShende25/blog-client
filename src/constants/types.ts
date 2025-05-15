// biome-ignore lint/style/useImportType: <explanation>
import { z } from "zod";
import type {
	createPostSchema,
	loginSchema,
	signupSchema,
	verifyEmailSchema,
} from "@/constants/schema";

export interface ApiErrorResponse {
	success: false;
	message: string;
	errors?: { message: string; field?: string }[];
}
export type Post = {
	author: { username: string };
	authorId: string;
	categories: { name: string }[];
	content: string;
	createdAt: string;
	id: string;
	images: string[];
	slug: string;
	status: "PUBLISHED" | "DRAFT";
	title: string;
	updatedAt: string;
	coverImage: string;
};

export type Category = {
	id: string;
	name: string;
};

export type LoginInput = z.infer<typeof loginSchema>;

export type SignupInput = z.infer<typeof signupSchema>;

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export type CreatePostInput = z.infer<typeof createPostSchema>;
