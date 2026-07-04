import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { toast } from "sonner";
import { Comment } from "@/constants/types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function handleApiError(err: unknown) {
	if (axios.isAxiosError(err)) {
		const data = err.response?.data;

		if (Array.isArray(data)) {
			data.forEach((m) => {
				toast.error(m.message);
			});
		} else if (data?.message) {
			toast.error(data.message);
		} else {
			toast.error("Request failed");
		}
	} else {
		toast.error("Something went wrong");
	}
}

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
	year: "numeric",
	month: "short",
	day: "numeric",
});

export const buildCommentsTree = (comments: Comment[]) => {
	const map = new Map<string, Comment>();
	const roots: Comment[] = [];

	comments.forEach((c) => {
		map.set(c.id, {
			...c,
			replies: [],
		});
	});

	map.forEach((c) => {
		if (c.parentId === null) {
			roots.push(c);
			return;
		}
		const parent = map.get(c.parentId);
		if (parent) {
			parent.replies.push(c);
		}
	});

	return roots;
};
