import axios, { type AxiosRequestConfig } from "axios";

declare module "axios" {
	interface AxiosRequestConfig {
		_retry?: boolean;
	}
}

export const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
	withCredentials: true,
	timeout: 10_000,
});

let isRefreshing = false;

// Collect reuqests that failed during refreshing the token
let failedQueue: {
	resolve: (value?: any) => void;
	reject: (error?: unknown) => void;
	config: AxiosRequestConfig;
}[] = [];

const processQueue = async (error: unknown = null) => {
	for (const { resolve, reject, config } of failedQueue) {
		if (error) {
			reject(error);
		} else {
			try {
				config._retry = true;
				const response = await axiosInstance(config);
				resolve(response);
			} catch (err) {
				reject(err);
			}
		}
	}

	failedQueue = [];
};

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config as AxiosRequestConfig;
		if (
			error.response?.status !== 401 ||
			originalRequest._retry ||
			originalRequest.url?.startsWith("/auth")
		) {
			return Promise.reject(error);
		}

		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject, config: originalRequest });
			});
		}

		originalRequest._retry = true;
		isRefreshing = true;

		try {
			await axiosInstance.post("/auth/refresh");
			await processQueue();
			return axiosInstance(originalRequest);
		} catch (refreshError) {
			await processQueue(refreshError);
			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	},
);
