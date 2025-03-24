import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router';
import { fallback, zodValidator } from '@tanstack/zod-adapter';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';

import FeaturedCategories from '@/components/FeaturedCategories';
import PostCard from '@/components/PostCard';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Post } from '@/constants/types';
import { fetchPostListQueryOptions } from '@/api/postsApi';

export const blogSearchSchema = z.object({
  filter: fallback(z.string(), '').default(''),
  category: fallback(z.string(), '').default(''),
  sort: fallback(z.string(), 'createdAt:desc').default('createdAt:desc'),
});

export const Route = createFileRoute('/_layout/search')({
  component: RouteComponent,
  validateSearch: zodValidator(blogSearchSchema),
});

function RouteComponent() {
  const [sortValue, setSortValue] = useState('');
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { ref, inView } = useInView();

  const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(
      fetchPostListQueryOptions(search.category, search.filter, sortValue)
    );

  useEffect(() => {
    if (inView) {
      fetchNextPage();
    }
  }, [fetchNextPage, inView]);

  const handleSortChange = (val: string) => {
    setSortValue(val);
    navigate({
      to: '/search',
      search: (prev) => ({
        ...prev,
        sort: val,
      }),
    });
  };

  return (
    <section className="pd-x pd-y">
      <h1 className="text-3xl md:text-4xl font-bold tracking-wider py-6">
        Search Posts
      </h1>

      <FeaturedCategories />

      <p className="text-lg">
        {data?.pages[0]?.meta?.totalItems || 0} results found
        {search.category && ` in category "${search.category}"`}
        {search.filter && ` for "${search.filter}"`}
      </p>

      <div className="flex justify-end items-center gap-6 md:gap-10 my-4">
        <Select onValueChange={(v) => handleSortChange(v)}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Created Date</SelectLabel>
              <SelectItem value="createdAt:desc">Newest</SelectItem>
              <SelectItem value="createdAt:asc">Oldest</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Link
          to="/search"
          search={(prev) => ({
            ...prev,
            filter: '',
          })}
        >
          <p className="underline cursor-pointer">clear filter</p>
        </Link>
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
  );
}
