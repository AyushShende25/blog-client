import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

import PostCard from '@/components/PostCard';
import { Button } from '@/components/ui/button';
import { postsApi } from '@/api/postsApi';
import type { Post } from '@/constants/types';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/_layout/')({
  component: HomeComponent,
});

function HomeComponent() {
  const { ref, inView } = useInView();

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ['posts'],
      queryFn: postsApi.fetchPostList,
      initialPageParam: 1,
      getNextPageParam: (lastPage, _allPages, lastPageParam) => {
        if (lastPageParam >= lastPage.meta.totalPages) {
          return undefined;
        }
        return lastPageParam + 1;
      },
    });

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  return (
    <section className="pd-x pd-y">
      <h1 className="text-5xl md:text-6xl lg:text-7xl  tracking-wider py-6 text-center">
        <span className="font-extrabold leading-relaxed">
          Unleash Your Voice:{' '}
        </span>
        <span className="font-semibold leading-relaxed">
          Share, Discover, and Inspire.
        </span>
      </h1>
      <p className="space-x-4 text-lg font-semibold text-center">
        <Button>
          <Link to="/signup">Join Now</Link>
        </Button>{' '}
        <span>and get Inspired!</span>
      </p>
      <div className="h-1 bg-foreground w-full my-10" />
      <section>
        <div className="mb-8 space-x-4 md:space-x-6 rounded-lg">
          <Badge className="text-lg mb-3 cursor-pointer" variant="secondary">
            All Posts
          </Badge>
          <Badge className="text-lg mb-3 cursor-pointer" variant="outline">
            Food
          </Badge>
          <Badge className="text-lg mb-3 cursor-pointer" variant="outline">
            Lifestyle
          </Badge>
          <Badge className="text-lg mb-3 cursor-pointer" variant="outline">
            Health
          </Badge>
          <Badge className="text-lg mb-3 cursor-pointer" variant="outline">
            Technology
          </Badge>
          <Badge className="text-lg mb-3 cursor-pointer" variant="outline">
            Travel
          </Badge>
          <Badge className="text-lg mb-3 cursor-pointer" variant="outline">
            Artist
          </Badge>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {data?.pages.map((page) => {
            return page.data.map((item: Post) => (
              <PostCard key={item.id} postData={item} />
            ));
          })}
        </div>

        <div ref={ref} />

        <p className="bg-muted my-4 py-4 rounded-lg text-center font-semibold">
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
              ? 'Load Newer'
              : 'Nothing more to load'}
        </p>
      </section>
    </section>
  );
}
