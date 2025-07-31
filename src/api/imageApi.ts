import axios from "axios";
import { api } from "./axiosInstance";

export const imageApi = {
	getPresignedUrl: async (
		filename: string,
		filetype: string,
		imageType: "avatar" | "post" = "post",
	) => {
		const res = await api.post("/posts/generate-presigned-url", {
			filename,
			filetype,
			imageType,
		});
		return res.data;
	},

	uploadToS3: async (signedUrl: string, file: File) => {
		await axios.put(signedUrl, file, {
			headers: { "Content-Type": file.type },
		});
	},
};
