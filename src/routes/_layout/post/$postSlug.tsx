import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';

import { fetchPostQueryOptions } from '@/api/postsApi';

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

  return (
    <article className="pd-x pd-y">
      <div className="md:px-20 lg:px-28">
        <h1 className="text-5xl md:text-6xl lg:text-7xl  tracking-wider py-6  font-semibold mb-6">
          {data?.data.title}
        </h1>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16">
            <img className="rounded-full" src="/user2.jpg" alt="author pic" />
          </div>
          <div>
            <p>
              By{' '}
              <span className="font-semibold">
                {data?.data.author.username}
              </span>
            </p>
            <p>
              {new Date(data?.data.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="w-full py-10">
          <img
            src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="cover"
          />
        </div>
        <p className="px-4  text-lg"> {data?.data.content}</p>
        <div className="h-[400px] bg-secondary my-10">comments section</div>
      </div>
    </article>
  );
}
