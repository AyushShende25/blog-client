export interface ApiErrorResponse {
	success: false;
	message: string;
	errors?: { message: string; field?: string }[];
}
