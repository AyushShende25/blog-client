import * as z from "zod";

export const createPostFormSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, "Title cannot be empty")
		.max(200, "Title must be less than 200 characters"),
	content: z.string().trim().optional(),
	status: z.enum(["DRAFT", "PUBLISHED"]),
	categories: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.min(1, "Select at least one category")
		.max(3, "Maximum 3 categories allowed"),
	tags: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.min(1, "Provide at least one tag")
		.max(5, "Maximum 5 tags allowed"),

	coverImage: z
		.union([
			z.url(),
			z.file().max(10_000_000).mime(["image/png", "image/jpeg", "image/webp"]),
			z.null(),
		])
		.optional(),
});
export type CreatePostFormInput = z.infer<typeof createPostFormSchema>;

export const updatePostFormSchema = z.object({
	title: z.string().trim().min(1).max(200).optional(),
	content: z.string().trim().optional(),
	status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
	categories: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.min(1, "Select at least one category")
		.max(3, "Maximum 3 categories allowed")
		.optional(),
	tags: z
		.array(
			z.object({
				id: z.string(),
				name: z.string(),
			}),
		)
		.min(1, "Provide at least one tag")
		.max(5, "Maximum 5 tags allowed")
		.optional(),
	coverImage: z
		.union([
			z.url(),
			z.file().max(10_000_000).mime(["image/png", "image/jpeg", "image/webp"]),
			z.null(),
		])
		.optional(),
});
export type UpdatePostFormInput = z.infer<typeof updatePostFormSchema>;

export const updateMeFormSchema = z.object({
	bio: z.string().trim().max(300).optional(),
	socialLinks: z
		.array(
			z.object({
				platform: z.enum(["twitter", "linkedin", "github"]),
				link: z.url(),
			}),
		)
		.optional(),
	username: z.string().trim().min(3).max(30).optional(),
});

export type UpdateMeFormInput = z.infer<typeof updateMeFormSchema>;

export const blogSearchSchema = z.object({
	search: z.string().catch(""),
	category: z.string().catch(""),
	tag: z.string().catch(""),
	sort: z.string().catch("publishedAt:desc"),
	dateFrom: z.string().optional(),
	dateTo: z.string().optional(),
});

export type BlogSearchParams = z.infer<typeof blogSearchSchema>;

export const authSearchParamsSchema = z.object({
	redirect: z.string().startsWith("/").optional().catch("/"),
});

export const verifyEmailSearchParamsSchema = z.object({
	...authSearchParamsSchema.shape,
	token: z.uuid("Invalid token"),
});

export const loginFormSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().trim().min(1, "paasword cannot be empty"),
});
export type LoginFormInput = z.infer<typeof loginFormSchema>;

export const signupFormSchema = z.object({
	username: z
		.string()
		.trim()
		.min(3, "username should be greater than 3 characters")
		.max(30, "username should not be greater than 30 characters"),
	email: z.email("Invalid email address"),
	password: z
		.string()
		.trim()
		.min(8, "Password must be more than 8 characters")
		.max(72, "Password must be less than 72 characters"),
});
export type SignupFormInput = z.infer<typeof signupFormSchema>;

export const verifyEmailSchema = z.object({
	verificationCode: z.string().trim().min(6, "otp is of 6 digits"),
});

export const createMediaSchema = z.object({
	url: z.url(),
	mimeType: z.string(),
	size: z.number().positive(),
	type: z.enum(["IMAGE", "VIDEO"]),
});

export type CreateMediaInput = z.infer<typeof createMediaSchema>;
