import { useForm } from '@tanstack/react-form';
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { AxiosError } from 'axios';

import { authApi } from '@/api/authApi';
import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ApiErrorResponse } from '@/constants/types';
import { signupSchema, authSearchSchema } from '@/constants/schema';
import { userQueryOptions } from '@/api/userApi';

export const Route = createFileRoute('/signup')({
  component: SignupComponent,
  validateSearch: zodValidator(authSearchSchema),
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions());
    if (user) {
      throw redirect({ to: search.redirect });
    }
  },
});

function SignupComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    validators: {
      onChange: signupSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authApi.signup(value);
        await navigate({ to: '/verify-email' });
        return null;
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

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Register</CardTitle>
              <CardDescription>
                Start your journey with Inkspire
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <div className="flex flex-col gap-6">
                  <form.Field
                    name="username"
                    children={(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder="John225"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  />

                  <form.Field
                    name="email"
                    children={(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  />

                  <form.Field
                    name="password"
                    children={(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  />

                  <form.Subscribe
                    selector={(state) => [state.errorMap]}
                    children={([errorMap]) =>
                      errorMap.onSubmit ? (
                        <p className="text-destructive  text-sm">
                          {errorMap.onSubmit?.toString()}
                        </p>
                      ) : null
                    }
                  />

                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <Button type="submit" disabled={!canSubmit} className="">
                        {isSubmitting ? '...' : 'Signup'}
                      </Button>
                    )}
                  />
                </div>

                <div className="mt-4 text-center text-sm">
                  Already have an account?{' '}
                  <Link to="/login" className="underline underline-offset-4">
                    Login
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
