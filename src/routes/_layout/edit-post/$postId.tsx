import { fetchpostByIdQueryOptions } from '@/api/postsApi';
import { userQueryOptions } from '@/api/userApi';
import PostForm from '@/components/PostForm';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, notFound, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/edit-post/$postId')({
  component: EditPost,
  beforeLoad: async ({ context, params }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions());
    if (!user) {
      throw redirect({ to: '/login' });
    }
    try {
      await context.queryClient.ensureQueryData(
        fetchpostByIdQueryOptions(params.postId)
      );
    } catch (err) {
      // If the post is not found or query fails
      throw notFound();
    }
  },
});

function EditPost() {
  const { postId } = Route.useParams();
  const { data: postData } = useSuspenseQuery(
    fetchpostByIdQueryOptions(postId)
  );
  return <PostForm mode="edit" post={postData?.data} postId={postId} />;
}
