import { useForm } from '@tanstack/react-form';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import { AxiosError } from 'axios';

import { authApi } from '@/api/authApi';
import FieldInfo from '@/components/FieldInfo';
import { Button } from '@/components/ui/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import type { ApiErrorResponse } from '@/constants/types';
import { authSearchSchema, verifyEmailSchema } from '@/constants/schema';
import { userQueryOptions } from '@/api/userApi';

export const Route = createFileRoute('/verify-email')({
  component: VerifyEmailComponent,
  validateSearch: zodValidator(authSearchSchema),
  beforeLoad: async ({ context, search }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions());
    if (user) {
      throw redirect({ to: search.redirect });
    }
  },
});

function VerifyEmailComponent() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      verificationCode: '',
    },
    validators: {
      onChange: verifyEmailSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await authApi.verifyEmail(value);
        await navigate({ to: '/login' });
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
    <form
      className="flex-center flex-col min-h-svh gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="verificationCode"
        children={(field) => (
          <div className="space-y-3">
            <Label className="font-semibold text-lg" htmlFor="verificationCode">
              Enter the verification code
            </Label>
            <InputOTP
              autoFocus
              id="verificationCode"
              value={field.state.value || ''}
              onChange={field.handleChange}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
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
            {isSubmitting ? '...' : 'Submit'}
          </Button>
        )}
      />
    </form>
  );
}
