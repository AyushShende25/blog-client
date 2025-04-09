import { createFileRoute, redirect } from '@tanstack/react-router';

import Editor from '@/components/Editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import CategorySelector from '@/components/CategorySelector';
import { userQueryOptions } from '@/api/authApi';

export const Route = createFileRoute('/_layout/newPost')({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions());
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
});

function RouteComponent() {
  return (
    <section className="pd-x pd-y">
      <div className=" shadow rounded">
        <div className="px-6 py-4 bg-white">
          <div className="flex gap-4">
            <Button className="mb-6" variant={'outline'}>
              Add a cover image
            </Button>
            <CategorySelector />
          </div>
          <Input
            placeholder="New Post Title"
            className="border-none font-semibold focus-visible:ring-0 text-3xl md:text-4xl h-full shadow-none"
          />
        </div>
        <Separator className="h-4 bg-transparent" />
        <div className="h-80">
          <Editor />
        </div>
      </div>
      <div className="my-4 space-x-4">
        <Button>Publish</Button>
        <Button variant={'outline'}>Save as draft</Button>
      </div>
    </section>
  );
}
