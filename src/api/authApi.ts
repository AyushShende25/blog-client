import { axiosInstance } from "@/api/axiosInstance";
import { QueryStaleTime } from "@/constants";
import type { LoginFormInput, SignupFormInput } from "@/constants/schema";
import type { User } from "@/constants/types";
import { handleApiError } from "@/lib/utils";
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { toast } from "sonner";

type AuthResponse = {
	message: string;
};

type UserResponse = {
	user: User;
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

	getMe: async (): Promise<UserResponse | null> => {
		try {
			const res = await axiosInstance.get<UserResponse>("/users/me");
			return res.data;
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

export function useLogout() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	return useMutation({
		mutationFn: authApi.logout,
		onSettled: async () => {
			queryClient.clear();

			await navigate({
				to: "/login",
			});
		},
	});
}

export function useLogin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: authApi.login,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: authKeys.me });
		},
		onError: handleApiError,
	});
}

export function useSignup() {
	return useMutation({
		mutationFn: authApi.signup,
		onSuccess: async () => {
			toast.success("User registered successfully. Please verify your email.");
		},
		onError: handleApiError,
	});
}

export function useVerifyEmail() {
	const navigate = useNavigate();
	return useMutation({
		mutationFn: authApi.verifyEmail,
		onSuccess: async () => {
			toast.success("User verified successfully.");
			await navigate({ to: "/login" });
		},
		onError: handleApiError,
	});
}
