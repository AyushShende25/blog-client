import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { socialLinksMap } from "@/constants";
import { type Platform, ROLES, type User } from "@/constants/types";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useDeleteMe, useUpdateMe } from "@/api/userApi";
import { useForm } from "@tanstack/react-form";
import { type UpdateMeFormInput, updateMeFormSchema } from "@/constants/schema";
import { getApiErrorMessage } from "@/lib/utils";
import { Field, FieldError } from "@/components/ui/field";
import { Textarea } from "./ui/textarea";
import { TrashIcon, XIcon } from "@phosphor-icons/react";
import { Input } from "./ui/input";

function ProfileCard({
	user,
	isEditing,
	onEdit,
	onCancel,
	onSuccess,
}: {
	user: User;
	isEditing: boolean;
	onEdit: () => void;
	onCancel: () => void;
	onSuccess: () => void;
}) {
	const updateMeMutation = useUpdateMe();
	const deleteMeMutation = useDeleteMe();

	const form = useForm({
		defaultValues: {
			username: user.username,
			bio: user.bio ?? "",
			socialLinks: user.socialLinks ?? [],
		} as UpdateMeFormInput,
		validators: {
			onChange: updateMeFormSchema,

			onSubmitAsync: async ({ value }) => {
				try {
					await updateMeMutation.mutateAsync(value);

					onSuccess();

					return null;
				} catch (error: unknown) {
					return getApiErrorMessage(error);
				}
			},
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
		>
			<Card className="pt-18">
				<CardHeader className="text-center space-y-4">
					<CardTitle className="text-2xl">
						{isEditing ? (
							<form.Field
								name="username"
								children={(field) => {
									const isInvalid =
										field.state.meta.isTouched && !field.state.meta.isValid;
									return (
										<Field data-invalid={isInvalid}>
											<input
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => field.handleChange(e.target.value)}
												aria-invalid={isInvalid}
												className="focus-visible:outline-none text-center"
											/>
											{isInvalid && (
												<FieldError errors={field.state.meta.errors} />
											)}
										</Field>
									);
								}}
							/>
						) : (
							user.username
						)}
					</CardTitle>
					<div className="flex items-center justify-center gap-3">
						<div className="space-x-1">
							<span>{user._count.followers}</span>
							<span>Followers</span>
						</div>
						<div className="space-x-1">
							<span>{user._count.following}</span>
							<span>Following</span>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-6">
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground min-w-15">
								Email:
							</span>
							<span className="text-sm">{user.email}</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground min-w-15">
								Bio:
							</span>
							{isEditing ? (
								<form.Field
									name="bio"
									children={(field) => {
										const isInvalid =
											field.state.meta.isTouched && !field.state.meta.isValid;
										return (
											<Field data-invalid={isInvalid}>
												<Textarea
													id={field.name}
													name={field.name}
													value={field.state.value}
													onBlur={field.handleBlur}
													onChange={(e) => field.handleChange(e.target.value)}
													aria-invalid={isInvalid}
												/>
												{isInvalid && (
													<FieldError errors={field.state.meta.errors} />
												)}
											</Field>
										);
									}}
								/>
							) : (
								<span>{user.bio}</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground min-w-15">
								Socials:
							</span>

							{isEditing ? (
								<form.Field name="socialLinks" mode="array">
									{(field) => (
										<div className="flex-1 space-y-3">
											{field.state.value?.map((_, i) => (
												<div key={i} className="flex items-center gap-2">
													<form.Field name={`socialLinks[${i}].platform`}>
														{(platformField) => (
															<select
																value={platformField.state.value}
																onBlur={platformField.handleBlur}
																onChange={(e) =>
																	platformField.handleChange(
																		e.target.value as Platform,
																	)
																}
																className="border px-2 py-2"
															>
																{Object.entries(socialLinksMap).map(
																	([platform, Icon]) => (
																		<option
																			key={platform}
																			value={platform}
																			className="capitalize"
																		>
																			{platform}
																		</option>
																	),
																)}
															</select>
														)}
													</form.Field>

													<form.Field name={`socialLinks[${i}].link`}>
														{(linkField) => (
															<Input
																type="url"
																value={linkField.state.value}
																onBlur={linkField.handleBlur}
																onChange={(e) =>
																	linkField.handleChange(e.target.value)
																}
																placeholder="https://..."
															/>
														)}
													</form.Field>
													<Button
														type="button"
														variant="destructive"
														size="icon"
														className="cursor-pointer"
														onClick={() => field.removeValue(i)}
													>
														<XIcon />
													</Button>
												</div>
											))}

											<Button
												type="button"
												variant="outline"
												onClick={() =>
													field.pushValue({
														platform: "github",
														link: "",
													})
												}
											>
												Add link
											</Button>
										</div>
									)}
								</form.Field>
							) : (
								<div className="flex gap-2">
									{user.socialLinks?.map((item) => {
										const Icon = socialLinksMap[item.platform];

										if (!Icon) return null;

										return (
											<Button
												size="icon-lg"
												variant="ghost"
												asChild
												key={item.platform}
											>
												<Link to={item.link} target="_blank">
													<Icon className="size-6" />
												</Link>
											</Button>
										);
									})}
								</div>
							)}
						</div>
						<div className="flex items-center gap-2">
							<span className="text-sm font-medium text-muted-foreground min-w-15">
								Joined:
							</span>
							<span className="text-sm">
								{user && new Date(user.createdAt).toDateString()}
							</span>
						</div>
						{user?.role === ROLES.ADMIN ? (
							<div className="flex items-center gap-2">
								<span className="text-sm font-medium text-muted-foreground min-w-15">
									Role:
								</span>
								<span className="text-sm">{user.role}</span>
							</div>
						) : null}
					</div>
				</CardContent>
			</Card>
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
			{isEditing ? (
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<div className="mt-6 flex justify-end gap-3">
							<Button
								type="submit"
								size="lg"
								className="cursor-pointer"
								disabled={!canSubmit || isSubmitting}
							>
								{isSubmitting ? "Updating..." : "Save"}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => {
									form.reset();
									onCancel();
								}}
							>
								Cancel
							</Button>
						</div>
					)}
				/>
			) : (
				<div className="mt-6 flex justify-between items-center gap-3">
					<Button
						className="cursor-pointer"
						onClick={() => deleteMeMutation.mutate()}
						size="lg"
						variant="destructive"
						type="button"
					>
						<TrashIcon />
						<span>Delete Account</span>
					</Button>
					<Button
						size="lg"
						type="button"
						className="cursor-pointer"
						onClick={onEdit}
					>
						Edit Profile
					</Button>
				</div>
			)}
		</form>
	);
}
export default ProfileCard;
