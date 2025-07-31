import { userApi } from "@/api/userApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function useSavePost() {
	const queryClient = useQueryClient();

	const {
		mutate: savePostMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: (postId: string) => userApi.savePost(postId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["saved", "user", "posts"],
			});
			toast.success("Post saved to library");
		},
		onError: (err) => {
			toast.error("Failed to save post");
			console.error(err);
		},
	});
	return { savePostMutation, isPending, error, isError };
}
export default useSavePost;
