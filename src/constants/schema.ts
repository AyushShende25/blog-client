import { fallback } from "@tanstack/zod-adapter";
import { z } from "zod";

export const createPostSchema = z.object({
	title: z.string().min(1, "Title is required"),
	content: z.string().optional(),
	status: z.enum(["DRAFT", "PUBLISHED"]),
	coverImage: z.string().optional(),
	images: z.string().array().optional(),
	categories: z.string().array().min(1, "select atleast one category"),
});

export const blogSearchSchema = z.object({
	filter: fallback(z.string(), "").default(""),
	category: fallback(z.string(), "").default(""),
	sort: fallback(z.string(), "createdAt:desc").default("createdAt:desc"),
});

export const authSearchSchema = z.object({
	redirect: fallback(z.string(), "/").default("/"),
});

export const loginSchema = z.object({
	email: z.string().trim().email("Invalid email address"),
	password: z.string().trim().min(1, "paasword cannot be empty"),
});

export const signupSchema = z.object({
	username: z.string().trim().min(1, "username cannot be empty"),
	email: z.string().trim().email("Invalid email address"),
	password: z
		.string()
		.trim()
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters"),
});

export const verifyEmailSchema = z.object({
	verificationCode: z.string().trim().min(6, "otp is of 6 digits"),
});
