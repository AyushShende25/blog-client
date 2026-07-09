import { userQueryOptions } from "@/api/authApi";
import { fetchCategoriesQueryOptions } from "@/api/categoriesApi";
import { fetchPostByIdQueryOptions, useUpdatePost } from "@/api/postsApi";
import { fetchTagsQueryOptions, useCreateTag } from "@/api/tagsApi";
import MultiSelect from "@/components/MultiSelect";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	type UpdatePostFormInput,
	updatePostFormSchema,
} from "@/constants/schema";
import { useForm } from "@tanstack/react-form";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import Editor from "@/components/text-editor/Editor";
import { extractMediaIds, getApiErrorMessage } from "@/lib/utils";
import { putToS3 } from "@/api/mediaApi";
import { POST_STATUS } from "@/constants/types";
import CoverImageInput from "@/components/CoverImageInput";

export const Route = createFileRoute("/_site/posts/edit/$id")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const data = await context.queryClient.ensureQueryData(userQueryOptions());
		if (!data?.user) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async ({ context, params }) => {
		return await context.queryClient.ensureQueryData(
			fetchPostByIdQueryOptions(params.id),
		);
	},
});

function RouteComponent() {
	const { id } = Route.useParams();
	const navigate = useNavigate();

	const postQuery = useSuspenseQuery(fetchPostByIdQueryOptions(id));
	const post = postQuery.data?.post;
	const categoriesQuery = useQuery(fetchCategoriesQueryOptions());
	const tagsQuery = useQuery(fetchTagsQueryOptions());
	const createTagMutation = useCreateTag();
	const updatePostMutation = useUpdatePost();

	const form = useForm({
		defaultValues: {
			title: post.title,
			content: post.content,
			status: post.status,
			categories: post.categories,
			tags: post.tags,
			coverImage: post.coverImage,
		} as UpdatePostFormInput,
		validators: {
			onChange: updatePostFormSchema,
			onSubmitAsync: async ({ value }) => {
				try {
					const coverImageUrl =
						value.coverImage instanceof File
							? await putToS3(value.coverImage, "POST")
							: value.coverImage;

					const mediaIds = extractMediaIds(value.content ?? "");

					await updatePostMutation.mutateAsync({
						postId: post.id,
						input: {
							title: value.title,
							content: value.content,
							status: value.status,
							coverImage: coverImageUrl,
							categoryIds: value.categories?.map((c) => c.id),
							tagIds: value.tags?.map((t) => t.id),
							mediaIds: mediaIds,
						},
					});

					navigate({
						to:
							value.status === POST_STATUS.PUBLISHED
								? "/dashboard/published"
								: "/dashboard/draft",
					});

					return null;
				} catch (error: unknown) {
					return getApiErrorMessage(error);
				}
			},
		},
	});

	return (
		<main className="container px-4 sm:px-10 lg:px-14">
			<div className="my-3 md:my-6">
				<h1 className="text-3xl font-semibold py-2">Edit Post</h1>
			</div>
			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="bg-accent px-4 py-4 rounded-md md:px-10 md:py-8 mb-4 space-y-6">
					<form.Field
						name="coverImage"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;

							return (
								<Field className="w-fit" data-invalid={isInvalid}>
									<CoverImageInput
										value={field.state.value}
										onChange={field.handleChange}
										onBlur={field.handleBlur}
									/>

									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>

					<form.Field
						name="title"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<Input
										id={field.name}
										name={field.name}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(e) => field.handleChange(e.target.value)}
										aria-invalid={isInvalid}
										className="border-none focus-visible:ring-0 text-3xl md:text-5xl px-0 shadow-none cursor-text h-full dark:bg-transparent"
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
					<div className="flex flex-col md:flex-row gap-3 md:gap-6 items-center">
						<form.Field
							name="categories"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<MultiSelect
											options={categoriesQuery.data?.categories ?? []}
											value={field.state.value ?? []}
											onChange={field.handleChange}
											placeholder="Select categories"
											searchPlaceholder="Search categories..."
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
						<form.Field
							name="tags"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<MultiSelect
											options={tagsQuery.data?.tags ?? []}
											value={field.state.value ?? []}
											onChange={field.handleChange}
											onCreateOption={async (name) => {
												const { tag } = await createTagMutation.mutateAsync({
													name,
												});

												return tag;
											}}
											placeholder="Select tags"
											searchPlaceholder="Search tags..."
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</div>
					<form.Field
						name="content"
						children={(field) => {
							const isInvalid =
								field.state.meta.isTouched && !field.state.meta.isValid;
							return (
								<Field data-invalid={isInvalid}>
									<Editor
										value={field.state.value}
										onChange={field.handleChange}
									/>
									{isInvalid && <FieldError errors={field.state.meta.errors} />}
								</Field>
							);
						}}
					/>
				</div>
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
						<div className="flex gap-4 w-full justify-end">
							<Button
								type="submit"
								size="lg"
								className="cursor-pointer"
								disabled={!canSubmit || isSubmitting}
								onClick={() => {
									form.setFieldValue("status", POST_STATUS.PUBLISHED);
								}}
							>
								{post.status === POST_STATUS.PUBLISHED ? "Update" : "Publish"}
							</Button>

							{post.status === POST_STATUS.DRAFT ? (
								<Button
									type="submit"
									size="lg"
									variant="outline"
									className="cursor-pointer"
									disabled={!canSubmit || isSubmitting}
									onClick={() => {
										form.setFieldValue("status", POST_STATUS.DRAFT);
									}}
								>
									Save Draft
								</Button>
							) : null}
						</div>
					)}
				/>
			</form>
		</main>
	);
}
