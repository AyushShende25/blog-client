import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import DOMPurify from 'dompurify';

import { fetchPostQueryOptions } from '@/api/postsApi';
import type { Post } from '@/constants/types';

export const Route = createFileRoute('/_layout/post/$postSlug')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      fetchPostQueryOptions(params.postSlug)
    );
  },
});

function RouteComponent() {
  const { postSlug } = Route.useParams();
  const { data } = useSuspenseQuery(fetchPostQueryOptions(postSlug));
  const { coverImage, title, content, author, createdAt } = data?.data as Post;

  return (
    <article className="pd-x pd-y">
      <div className="md:px-20 lg:px-28">
        <h1 className="text-5xl md:text-6xl lg:text-7xl  tracking-wider py-6  font-semibold mb-6">
          {title}
        </h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <img className="rounded-full" src="/user2.jpg" alt="author pic" />
          </div>
          <div>
            <p>
              By <span className="font-semibold">{author.username}</span>
            </p>
            <p>
              {new Date(createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        {coverImage && (
          <div className="w-full py-10">
            <img src={coverImage} alt={title} />
          </div>
        )}
        <div className=" px-4 py-6 text-lg">
          <div
            className="tiptap-editor"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />
        </div>
      </div>
    </article>
  );
}
