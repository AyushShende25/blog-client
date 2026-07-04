import {
	FileTextIcon,
	PencilSimpleIcon,
	UserIcon,
	ChartBarIcon,
	UsersIcon,
	TagIcon,
	BookmarksIcon,
	LinkedinLogoIcon,
	XLogoIcon,
	GithubLogoIcon,
	Icon,
	HashIcon,
} from "@phosphor-icons/react";
import { linkOptions } from "@tanstack/react-router";
import type { Platform } from "./types";

export const DashboardNavItems = linkOptions([
	{
		title: "Published",
		to: "/dashboard/published",
		icon: FileTextIcon,
	},
	{
		title: "Drafts",
		to: "/dashboard/draft",
		icon: PencilSimpleIcon,
	},
	{
		title: "Profile",
		to: "/dashboard/profile",
		icon: UserIcon,
	},
	{
		title: "Bookmarks",
		to: "/dashboard/bookmarks",
		icon: BookmarksIcon,
	},
]);

export const AdminNavItems = linkOptions([
	{
		title: "Analytics",
		to: "/admin/analytics",
		icon: ChartBarIcon,
	},
	{
		title: "Posts",
		to: "/admin/posts",
		icon: FileTextIcon,
	},
	{
		title: "Users",
		to: "/admin/users",
		icon: UsersIcon,
	},
	{
		title: "Categories",
		to: "/admin/categories",
		icon: TagIcon,
	},
	{
		title: "Tags",
		to: "/admin/tags",
		icon: HashIcon,
	},
]);

export const socialLinksMap: Record<Platform, Icon> = {
	linkedin: LinkedinLogoIcon,
	twitter: XLogoIcon,
	github: GithubLogoIcon,
};

export const QueryStaleTime = 5 * 60 * 1000;
