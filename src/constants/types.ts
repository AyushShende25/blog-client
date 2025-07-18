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
	categories: { id: string; name: string }[];
	content: string;
	createdAt: string;
	id: string;
	images: string[];
	slug: string;
	status: POST_STATUS;
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

export const POST_STATUSES = {
	PUBLISHED: "PUBLISHED",
	DRAFT: "DRAFT",
} as const;

export type POST_STATUS = (typeof POST_STATUSES)[keyof typeof POST_STATUSES];

export const ROLES = {
	USER: "USER",
	ADMIN: "ADMIN",
} as const;

export type ROLE = (typeof ROLES)[keyof typeof ROLES];

export type SavedPost = Omit<Post, "author" | "categories">;

export type User = {
	createdAt: string;
	email: string;
	id: string;
	isVerified: boolean;
	role: ROLE;
	updatedAt: string;
	username: string;
	avatarUrl: string | null;
};
