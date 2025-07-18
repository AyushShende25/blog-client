import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { imageApi } from "@/api/imageApi";
import { userApi } from "@/api/userApi";

function useAvatarUpdate() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (file: File) => {
			const { data } = await imageApi.getPresignedUrl(
				file.name,
				file.type,
				"avatar",
			);
			await imageApi.uploadToS3(data?.url, file);
			await userApi.updateUserAvatar(data?.fileLink);
		},
		onSuccess: () => {
			toast.success("Avatar updated successfully");
			queryClient.invalidateQueries({ queryKey: ["user"] });
		},
		onError: (err) => {
			console.error("avatar upload error:", err);
			toast.error("Failed to upload avatar image");
		},
	});
}
export default useAvatarUpdate;
