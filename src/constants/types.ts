import type { Icon } from "@phosphor-icons/react";

export type Post = {
	id: string;
	slug: string;
	title: string;
	content: string;
	excerpt: string;
	metaTitle: string;
	metaDescription: string;
	ogImage: string | null;
	authorId: string;
	status: PostStatus;
	coverImage: string | null;
	publishedAt: string | null;
	createdAt: string;
	updatedAt: string;
	deletedAt: string | null;
	categories: Category[];
	tags: Tag[];
	media: { id: string; url: string; type: MediaType }[];
	author: {
		username: string;
		avatar: string | null;
		bio: string | null;
	} | null;
	_count: {
		likes: number;
		comments: number;
	};
};

export type Category = {
	id: string;
	name: string;
};

export type Tag = {
	id: string;
	name: string;
};

export const MEDIA_TYPE = {
	IMAGE: "IMAGE",
	VIDEO: "VIDEO",
} as const;

export type MediaType = (typeof MEDIA_TYPE)[keyof typeof MEDIA_TYPE];

export const MEDIA_USAGE = {
	AVATAR: "AVATAR",
	POST: "POST",
} as const;

export type MediaUsage = (typeof MEDIA_USAGE)[keyof typeof MEDIA_USAGE];

export const POST_STATUS = {
	PUBLISHED: "PUBLISHED",
	DRAFT: "DRAFT",
} as const;

export type PostStatus = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export const ROLES = {
	USER: "USER",
	ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const USER_STATUS = {
	ACTIVE: "ACTIVE",
	SUSPENDED: "SUSPENDED",
	DELETED: "DELETED",
} as const;

export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];

export type User = {
	id: string;
	email: string;
	username: string;
	avatar: string | null;
	bio: string | null;
	socialLinks: {
		platform: Platform;
		link: string;
	}[];
	role: Role;
	_count: {
		posts: number;
		followers: number;
		following: number;
	};
	createdAt: Date;
};

export type FormatOption = {
	label: string;
	icon: Icon;
	isActive?: boolean;
	isDisabled?: boolean;
	onClick: () => void;
};

export type Media = {
	id: string;
	url: string;
	type: MediaType;
	mimeType: string;
	size: number;
	postId: string | null;
	uploaderId: string | null;
	createdAt: Date;
};

export type Platform = "github" | "twitter" | "linkedin";

export type SavedPost = Omit<Post, "author" | "categories">;

export type Comment = {
	id: string;
	content: string;
	authorId: string | null;
	postId: string;
	isDeleted: boolean;
	parentId: string | null;
	createdAt: Date;
	updatedAt: Date;

	username: string;
	avatar: string | undefined;
	replies: Comment[];
};

export type CoverImageValue = string | File | null | undefined;
