import axios, { type AxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
	baseURL: import.meta.env.VITE_PUBLIC_BACKEND_URL,
	withCredentials: true,
	timeout: 10_000,
});

let isRefreshing = false;

// Collect reuqests that failed during refreshing the token
let failedQueue: {
	resolve: (value?: unknown) => void;
	reject: (error?: unknown) => void;
	config: AxiosRequestConfig & { _retry?: boolean };
}[] = [];

const processQueue = (error: unknown = null) => {
	failedQueue.forEach(({ resolve, reject, config }) => {
		if (error) {
			reject(error);
		} else {
			config._retry = true;
			resolve(axiosInstance(config));
		}
	});

	failedQueue = [];
};

axiosInstance.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status !== 401 || originalRequest._retry) {
			return Promise.reject(error);
		}
		originalRequest._retry = true;

		if (isRefreshing) {
			return new Promise((resolve, reject) => {
				failedQueue.push({ resolve, reject, config: originalRequest });
			});
		}
		isRefreshing = true;

		try {
			await axiosInstance.post("/auth/refresh");
			processQueue();
			return axiosInstance(originalRequest);
		} catch (refreshError) {
			processQueue(refreshError);
			return Promise.reject(refreshError);
		} finally {
			isRefreshing = false;
		}
	},
);
