import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import DOMPurify from 'dompurify';
import { motion, useScroll } from 'motion/react';

import { fetchPostQueryOptions } from '@/api/postsApi';
import type { Post, SavedPost } from '@/constants/types';
import { fetchSavedPostsQueryOptions, userQueryOptions } from '@/api/userApi';
import useSavePost from '@/hooks/useSavePost';
import useUnsavePost from '@/hooks/useUnsavePost';
import { Bookmark } from 'lucide-react';

export const Route = createFileRoute('/_layout/post/$postSlug')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      fetchPostQueryOptions(params.postSlug)
    );
  },
});

function RouteComponent() {
  const { scrollYProgress } = useScroll();

  const { postSlug } = Route.useParams();
  const { data: post } = useSuspenseQuery(fetchPostQueryOptions(postSlug));
  const { data: user } = useQuery(userQueryOptions());
  const { data: savedPostsData } = useQuery(
    fetchSavedPostsQueryOptions(!!user)
  );
  const { coverImage, title, content, author, createdAt, id } =
    post?.data as Post;

  const savedPosts = savedPostsData?.data ?? [];
  const isSaved = savedPosts.some((p: SavedPost) => p.id === id);

  const { savePostMutation } = useSavePost();
  const { unsavePostMutation } = useUnsavePost();

  const handleToggleSave = () => {
    if (isSaved) {
      unsavePostMutation(id);
    } else {
      savePostMutation(id);
    }
  };
  return (
    <>
      <motion.div
        id="scroll-indicator"
        style={{
          scaleX: scrollYProgress,
          originX: 0,
        }}
        className="fixed top-0 left-0 right-0 h-[8px] z-50 rounded bg-gradient-to-r from-neutral-900 to-neutral-300 "
      />
      <article className="pd-x pd-y">
        <div className="md:px-20 lg:px-28">
          <h1 className="text-5xl md:text-6xl lg:text-7xl  tracking-wider py-6  font-semibold mb-6">
            {title}
          </h1>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <img className="rounded-full" src="/user2.jpg" alt="author pic" />
            </div>
            <div className="w-full flex justify-between items-center">
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
              </div>{' '}
              <div onClick={handleToggleSave} className="cursor-pointer">
                {user ? (
                  isSaved ? (
                    <Bookmark fill="#000" />
                  ) : (
                    <Bookmark />
                  )
                ) : null}
              </div>
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
    </>
  );
}
