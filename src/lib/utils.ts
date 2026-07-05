import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import axios from "axios";
import { toast } from "sonner";
import type { Comment } from "@/constants/types";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type ApiError = {
	message: string;
	path?: string;
};

export const getApiErrorMessage = (err: unknown) => {
	if (axios.isAxiosError<ApiError[]>(err)) {
		const errors = err.response?.data;

		if (Array.isArray(errors) && errors.length > 0) {
			return errors.map((error) => error.message).join(". ");
		}
		return err.message || "Request failed";
	}
	if (err instanceof Error) {
		return err.message;
	}
	return "Something went wrong. Please try again later.";
};

export function handleApiError(err: unknown) {
	toast.error(getApiErrorMessage(err));
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

export const extractMediaIds = (html: string): string[] => {
	const document = new DOMParser().parseFromString(html, "text/html");

	return Array.from(
		document.querySelectorAll<HTMLImageElement>("img[data-media-id]"),
	)
		.map((image) => image.dataset.mediaId)
		.filter((id): id is string => Boolean(id));
};
