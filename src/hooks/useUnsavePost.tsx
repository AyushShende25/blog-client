import { userApi } from "@/api/userApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function useUnsavePost() {
	const queryClient = useQueryClient();

	const {
		mutate: unsavePostMutation,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: (postId: string) => userApi.unsavePost(postId),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["saved", "user", "posts"],
			});
			toast.success("Post removed from library");
		},
		onError: (err) => {
			toast.error("Failed to remove post from library");
			console.error(err);
		},
	});
	return { unsavePostMutation, isPending, error, isError };
}
export default useUnsavePost;
