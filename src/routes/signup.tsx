import { useForm } from "@tanstack/react-form";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
	component: RouteComponent,
});

export const signupSchema = z.object({
	username: z.string().trim().min(1, "username cannot be empty"),
	email: z.string().trim().email("Invalid email address"),
	password: z
		.string()
		.trim()
		.min(8, "Password must be more than 8 characters")
		.max(32, "Password must be less than 32 characters"),
});

function RouteComponent() {
	const form = useForm({
		defaultValues: {
			username: "",
			email: "",
			password: "",
		},
		validators: {
			onChange: signupSchema,
		},
		onSubmit: async ({ value }) => {
			// Do something with form data
			console.log(value);
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
												{field.state.meta.errors ? (
													<em className="text-destructive font-light text-sm">
														{field.state.meta.errors.join(", ")}
													</em>
												) : null}
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
												{field.state.meta.errors ? (
													<em className="text-destructive font-light text-sm">
														{field.state.meta.errors.join(", ")}
													</em>
												) : null}
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
												{field.state.meta.errors ? (
													<em className="text-destructive font-light text-sm">
														{field.state.meta.errors.join(", ")}
													</em>
												) : null}
											</div>
										)}
									/>

									<Button type="submit" className="w-full">
										Register
									</Button>
								</div>

								<div className="mt-4 text-center text-sm">
									Already have an account?{" "}
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
