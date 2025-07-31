import {
	BarChart3,
	BookOpen,
	Edit3,
	FileText,
	Tags,
	User,
	Users,
} from "lucide-react";

export const DashboardNavItems = [
	{
		title: "Published",
		url: "/dashboard/published",
		icon: FileText,
	},
	{
		title: "Drafts",
		url: "/dashboard/draft",
		icon: Edit3,
	},
	{
		title: "Profile",
		url: "/dashboard/profile",
		icon: User,
	},
	{
		title: "Library",
		url: "/dashboard/library",
		icon: BookOpen,
	},
];
export const AdminNavItems = [
	{
		title: "Analytics",
		url: "/admin/analytics",
		icon: BarChart3,
	},
	{
		title: "Posts",
		url: "/admin/posts",
		icon: FileText,
	},
	{
		title: "Users",
		url: "/admin/users",
		icon: Users,
	},
	{
		title: "Categories",
		url: "/admin/categories",
		icon: Tags,
	},
];
