import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

function stripHtml(html: string): string {
	const doc = new DOMParser().parseFromString(html, "text/html");
	return doc.body.textContent || "";
}

function truncate(str: string, length: number) {
	return str.length > length ? `${str.slice(0, length)}...` : str;
}

export function getPlainTextPreview(html: string, limit = 200) {
	return truncate(stripHtml(html), limit);
}
