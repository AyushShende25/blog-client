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
};
