import { useForm } from "@tanstack/react-form";
import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { userQueryOptions, useSignup } from "@/api/authApi";
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
import { authSearchParamsSchema, signupFormSchema } from "@/constants/schema";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { isAxiosError } from "axios";

export const Route = createFileRoute("/_auth/signup")({
	component: SignupComponent,
	validateSearch: authSearchParamsSchema,
	beforeLoad: async ({ context, search }) => {
		const data = await context.queryClient.ensureQueryData(userQueryOptions());
		if (data?.user) {
			throw redirect({ to: search.redirect });
		}
	},
});

function SignupComponent() {
	const signupMutation = useSignup();

	const form = useForm({
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
		validators: {
			onSubmit: signupFormSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				await signupMutation.mutateAsync(value);
				form.reset();
			} catch (err: unknown) {
				if (isAxiosError(err)) {
					const data = err.response?.data;
					if (Array.isArray(data)) {
						form.setErrorMap({
							onSubmit: {
								form: data.map((m) => m.message).join(", "),
								fields: {},
							},
						});
					} else {
						form.setErrorMap({
							onSubmit: {
								form: data.message ?? "Registration Failed",
								fields: {},
							},
						});
					}
				} else {
					form.setErrorMap({
						onSubmit: { form: "Something went wrong", fields: {} },
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
								id="signup-form"
								onSubmit={(e) => {
									e.preventDefault();
									e.stopPropagation();
									form.handleSubmit();
								}}
							>
								<FieldGroup>
									<form.Field
										name="username"
										children={(field) => {
											const isInvalid =
												field.state.meta.isTouched && !field.state.meta.isValid;
											return (
												<Field data-invalid={isInvalid}>
													<FieldLabel htmlFor={field.name}>Username</FieldLabel>
													<Input
														id={field.name}
														name={field.name}
														value={field.state.value}
														onBlur={field.handleBlur}
														onChange={(e) => field.handleChange(e.target.value)}
														aria-invalid={isInvalid}
														placeholder="John225"
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
							</form>
						</CardContent>
						<CardFooter className="flex flex-col gap-4">
							<form.Subscribe
								selector={(state) => state.errorMap.onSubmit?.form}
								children={(formError) =>
									formError ? (
										<p className="text-destructive text-sm">{`${formError}`}</p>
									) : null
								}
							/>
							<Field orientation="horizontal">
								<Button
									className="w-full cursor-pointer"
									type="submit"
									form="signup-form"
									disabled={signupMutation.isPending}
								>
									{signupMutation.isPending ? "Registering" : "Signup"}
								</Button>
							</Field>
							<Field orientation="horizontal">
								<div className="text-xs space-x-2">
									<span>Already have an account?</span>
									<Link to="/login">
										<span className="underline cursor-pointer">Login</span>
									</Link>
								</div>
							</Field>
						</CardFooter>
					</Card>
				</div>
			</div>
		</div>
	);
}
