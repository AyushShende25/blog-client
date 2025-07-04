import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Edit, Trash2, Clock } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { fetchUserPostsQueryOptions } from '@/api/postsApi';
import { type Post, POST_STATUSES } from '@/constants/types';
import { getPlainTextPreview } from '@/lib/utils';
import usePostDelete from '@/hooks/usePostDelete';

export const Route = createFileRoute('/_dashboard/dashboard/draft')({
  component: Drafts,
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      fetchUserPostsQueryOptions(POST_STATUSES.DRAFT)
    );
  },
});

function Drafts() {
  const { data } = useSuspenseQuery(
    fetchUserPostsQueryOptions(POST_STATUSES.DRAFT)
  );
  const drafts = data?.data ?? [];

  const { deletePostMutation, isPending } = usePostDelete(POST_STATUSES.DRAFT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
          <p className="text-muted-foreground">
            Continue working on your unpublished posts
          </p>
        </div>
        <Link to="/new-post">
          <Button className="gap-2 mt-3">
            <Edit />
            New Draft
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Drafts</div>
            <div className="text-2xl font-bold">{drafts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Drafts List */}
      <div className="space-y-4">
        {drafts.map((draft: Post) => (
          <Card
            key={draft.id}
            className="hover:shadow-md transition-all duration-200"
          >
            <CardContent className="p-6">
              <div className="md:flex items-start justify-between space-y-4">
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                      {draft.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1 line-clamp-3">
                      {getPlainTextPreview(draft.content)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock />
                      Last edited{' '}
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </div>
                    <div>{4000} words</div>
                    <Badge variant={'secondary'}>{draft.status}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link to="/edit-post/$postId" params={{ postId: draft?.id }}>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Edit />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon"
                    disabled={isPending}
                    onClick={() => deletePostMutation(draft.id)}
                  >
                    <Trash2 color="#fff" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {drafts.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Edit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
            <p className="text-muted-foreground mb-4">
              Start writing your first draft to see it here
            </p>
            <Link to="/new-post">
              <Button>Create New Draft</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
