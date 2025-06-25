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
import PostForm from '@/components/PostForm';

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
  return <PostForm mode="create" />;
}
