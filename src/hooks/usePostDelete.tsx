import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '@/api/postsApi';
import type { POST_STATUS } from '@/constants/types';
import { toast } from 'sonner';

function usePostDelete(status: POST_STATUS) {
  const queryClient = useQueryClient();

  const {
    mutate: deletePostMutation,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: (postId: string) => postsApi.deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['posts', 'user', { status }],
      });
      toast.success('Post deleted');
    },
    onError: (err) => {
      toast.error('Failed to delete post');
      console.error(err);
    },
  });
  return { deletePostMutation, isPending, error, isError };
}
export default usePostDelete;
