import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { useLogin, userQueryOptions } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	authSearchParamsSchema,
	type LoginFormInput,
	loginFormSchema,
} from "@/constants/schema";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { getApiErrorMessage } from "@/lib/utils";

export const Route = createFileRoute("/_auth/login")({
	component: LoginComponent,
	validateSearch: authSearchParamsSchema,
	beforeLoad: async ({ context, search }) => {
		const data = await context.queryClient.ensureQueryData(userQueryOptions());
		if (data?.user) {
			throw redirect({ to: search.redirect });
		}
	},
});

function LoginComponent() {
	const search = Route.useSearch();
	const navigate = useNavigate();
	const loginMutation = useLogin();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		} as LoginFormInput,
		validators: {
			onChange: loginFormSchema,
			onSubmitAsync: async ({ value }) => {
				try {
					await loginMutation.mutateAsync(value);
					await navigate({ to: search.redirect ?? "/" });
					return null;
				} catch (error) {
					return getApiErrorMessage(error);
				}
			},
		},
	});

	return (
		<div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
			<div className="w-full max-w-sm">
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
				>
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Login</CardTitle>
							<CardDescription>
								Enter your email below to login to your account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<FieldGroup>
								<form.Field
									name="email"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Email</FieldLabel>
												<Input
													id={field.name}
													type="email"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													placeholder="m@example.com"
													autoComplete="off"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
								<form.Field
									name="password"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<FieldLabel htmlFor={field.name}>Password</FieldLabel>
												<Input
													id={field.name}
													type="password"
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
													autoComplete="off"
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							</FieldGroup>
						</CardContent>
						<CardFooter className="flex flex-col gap-4">
							<form.Subscribe
								selector={(state) => [state.errorMap]}
								children={([errorMap]) =>
									errorMap.onSubmit ? (
										<div>
											<em className="text-destructive font-light">
												Form-Error: {errorMap.onSubmit}
											</em>
										</div>
									) : null
								}
							/>
							<form.Subscribe
								selector={(state) => [state.canSubmit, state.isSubmitting]}
								children={([canSubmit, isSubmitting]) => (
									<Button
										type="submit"
										size="lg"
										className="cursor-pointer w-full"
										disabled={!canSubmit || isSubmitting}
									>
										{isSubmitting ? "Logging in..." : "Login"}
									</Button>
								)}
							/>
							<Field orientation="horizontal">
								<div className="text-xs space-x-2">
									<span>Don't have an account?</span>
									<Link to="/signup">
										<span className="underline cursor-pointer">Register</span>
									</Link>
								</div>
							</Field>
						</CardFooter>
					</Card>
				</form>
			</div>
		</div>
	);
}
