import { axiosInstance } from "@/api/axiosInstance";
import { QueryStaleTime } from "@/constants";
import type { LoginFormInput, SignupFormInput } from "@/constants/schema";
import type { User } from "@/constants/types";

import { queryOptions } from "@tanstack/react-query";
import axios from "axios";

type AuthResponse = {
	message: string;
};

export const authApi = {
	signup: async (input: SignupFormInput): Promise<AuthResponse> => {
		const res = await axiosInstance.post<AuthResponse>("/auth/signup", input);
		return res.data;
	},
	login: async (input: LoginFormInput): Promise<AuthResponse> => {
		const res = await axiosInstance.post<AuthResponse>("/auth/login", input);
		return res.data;
	},
	verifyEmail: async (input: { token: string }): Promise<AuthResponse> => {
		const res = await axiosInstance.post<AuthResponse>(
			"/auth/verify-email",
			input,
		);
		return res.data;
	},
	refreshAccessToken: async (): Promise<AuthResponse> => {
		const res = await axiosInstance.post<AuthResponse>("/auth/refresh");
		return res.data;
	},
	logout: async (): Promise<void> => {
		await axiosInstance.post("/auth/logout");
	},

	getMe: async (): Promise<User | null> => {
		try {
			const res = await axiosInstance.get<{ user: User }>("/users/me");
			return res.data.user;
		} catch (error) {
			if (axios.isAxiosError(error) && error.response?.status === 401) {
				return null;
			}
			throw error;
		}
	},
};
export const authKeys = {
	me: ["auth", "user"] as const,
};

export const userQueryOptions = () =>
	queryOptions({
		queryKey: authKeys.me,
		queryFn: () => authApi.getMe(),
		staleTime: QueryStaleTime,
		retry: false,
	});
