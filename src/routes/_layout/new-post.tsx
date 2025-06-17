import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useForm, useStore } from '@tanstack/react-form';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { postsApi } from '@/api/postsApi';
import type { ApiErrorResponse, Category } from '@/constants/types';
import { fetchCategoriesQueryOptions } from '@/api/categoriesApi';
import MultiSelect from '@/components/MultiSelect';
import { createPostSchema } from '@/constants/schema';
import Tiptap from '@/components/Tiptap';
import { userQueryOptions } from '@/api/userApi';

export const Route = createFileRoute('/_layout/new-post')({
  component: NewPost,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions());
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
});

function NewPost() {
  const { data } = useQuery(fetchCategoriesQueryOptions());
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      status: 'DRAFT',
      coverImage: undefined,
      categories: [],
      images: [] as string[],
    },
    validators: {
      onChange: createPostSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const res = await postsApi.createPost(value);
        await queryClient.invalidateQueries({ queryKey: ['posts'] });
        if (res?.data.status === 'PUBLISHED') {
          await navigate({ to: `/post/${res?.data.slug}` });
        } else {
          await navigate({ to: '/dashboard/draft' });
        }
      } catch (error) {
        if (error instanceof AxiosError && error.response?.data) {
          const errorData = error.response.data as ApiErrorResponse;

          if (Array.isArray(errorData.errors)) {
            // biome-ignore lint/complexity/noForEach: <explanation>
            errorData.errors.forEach((err) =>
              form.setErrorMap({
                onSubmit: err.message,
              })
            );
          } else {
            form.setErrorMap({
              onSubmit: errorData.message,
            });
          }
        } else {
          form.setErrorMap({
            onSubmit: 'Unexpected error',
          });
        }
      }
    },
  });

  const handleCoverImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Request pre-signed URL
      const { data } = await postsApi.getPresignedUrl(file.name, file.type);
      const { url, fileLink } = data;

      // Upload to S3
      await postsApi.uploadToS3(url, file);

      // Set the cover image URL
      form.setFieldValue('coverImage', fileLink);

      toast.success('Cover image uploaded successfully');
    } catch (error) {
      console.error('Cover image upload error:', error);
      toast.error('Failed to upload cover image');
    }
  };

  const formErrorMap = useStore(form.store, (state) => state.errorMap);

  const coverImg = useStore(form.store, (state) => state.values.coverImage);
  return (
    <section className="pd-x pd-y">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className=" shadow rounded">
          <div className="px-6 py-4 bg-card">
            {coverImg && (
              <img
                className="mb-4 max-w-72 object-cover"
                src={coverImg}
                alt=""
              />
            )}
            <div className="flex flex-col md:flex-row gap-2 md:gap-4">
              <Label
                htmlFor="cover-image"
                className="md:mb-6 cursor-pointer bg-muted px-4 py-3 rounded"
              >
                <input
                  id="cover-image"
                  type="file"
                  accept="image/*"
                  className="hidden z-20"
                  onChange={handleCoverImageUpload}
                />
                Add a cover image
              </Label>
              <form.Field
                name="categories"
                children={(field) => (
                  <MultiSelect<Category>
                    options={data?.data || []}
                    //the selected prop receives full category objects, matching the selected IDs.
                    selected={
                      data?.data?.filter((cat: Category) =>
                        field.state.value.includes(cat.id)
                      ) ?? []
                    }
                    //updates the form field to store just the array of selected IDs.
                    onChange={(selected) =>
                      field.handleChange(selected.map((c) => c.id))
                    }
                    labelSelector={(cat) => cat.name}
                    valueSelector={(cat) => cat.id}
                    placeholder="Select categories"
                  />
                )}
              />
            </div>
            <form.Field
              name="title"
              children={(field) => (
                <Input
                  placeholder="New Post Title"
                  className="border-none font-semibold focus-visible:ring-0 text-3xl md:text-4xl h-full shadow-none"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            />
          </div>

          <div>
            <Tiptap
              onContentChange={(html) => form.setFieldValue('content', html)}
              onImageChange={(imgSrc) =>
                form.setFieldValue('images', [
                  ...(form.getFieldValue('images') ?? []),
                  imgSrc,
                ])
              }
            />
          </div>
        </div>

        {/* Form Errors */}
        <div>
          {formErrorMap.onChange ? (
            <div className="my-1">
              <em className="text-red-400">{`error on the form: ${formErrorMap.onChange}`}</em>
            </div>
          ) : null}
        </div>
        <div className="my-4 space-x-4">
          <Button onClick={() => form.setFieldValue('status', 'PUBLISHED')}>
            Publish
          </Button>
          <Button
            onClick={() => form.setFieldValue('status', 'DRAFT')}
            variant={'outline'}
          >
            Save as draft
          </Button>
        </div>
      </form>
    </section>
  );
}
