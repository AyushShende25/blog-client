import type { Media, MediaUsage } from "@/constants/types";
import { axiosInstance } from "./axiosInstance";
import axios from "axios";
import type { CreateMediaInput } from "@/constants/schema";

type GetPresignedUrlResponse = {
	uploadUrl: string;
	fileUrl: string;
	fileKey: string;
};

type GetPresignedUrlInput = {
	filename: string;
	mimeType: string;
	usage: MediaUsage;
};

type CreateMediaResponse = {
	media: Media;
};

export const mediaApi = {
	getPresignedUrl: async (
		input: GetPresignedUrlInput,
	): Promise<GetPresignedUrlResponse> => {
		const res = await axiosInstance.post<GetPresignedUrlResponse>(
			"/media/generate-presigned-url",
			input,
		);
		return res.data;
	},
	uploadToS3: async (signedUrl: string, file: File) => {
		await axios.put(signedUrl, file, {
			headers: { "Content-Type": file.type },
		});
	},
	createMedia: async (input: CreateMediaInput): Promise<Media> => {
		const res = await axiosInstance.post<CreateMediaResponse>("/media", input);
		return res.data.media;
	},
	deleteMedia: async (mediaId: string): Promise<void> => {
		await axiosInstance.delete(`/media/${mediaId}`);
	},
};

export async function putToS3(file: File, usage: MediaUsage): Promise<string> {
	const { uploadUrl, fileUrl } = await mediaApi.getPresignedUrl({
		filename: file.name,
		mimeType: file.type,
		usage,
	});
	await mediaApi.uploadToS3(uploadUrl, file);
	return fileUrl;
}
