import { userQueryOptions } from "@/api/authApi";
import {
	type CreatePostFormInput,
	createPostFormSchema,
} from "@/constants/schema";
import {
	type Category,
	type CoverImageValue,
	POST_STATUS,
	type Tag,
} from "@/constants/types";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetchCategoriesQueryOptions } from "@/api/categoriesApi";
import { fetchTagsQueryOptions, useCreateTag } from "@/api/tagsApi";
import Editor from "@/components/text-editor/Editor";
import { useCreatePost } from "@/api/postsApi";
import { putToS3 } from "@/api/mediaApi";
import MultiSelect from "@/components/MultiSelect";
import { extractMediaIds, getApiErrorMessage } from "@/lib/utils";
import CoverImageInput from "@/components/CoverImageInput";

export const Route = createFileRoute("/_site/posts/new")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const data = await context.queryClient.ensureQueryData(userQueryOptions());
		if (!data?.user) {
			throw redirect({ to: "/login" });
		}
	},
});

function RouteComponent() {
	const createPostMutation = useCreatePost();
	const createTagMutation = useCreateTag();
	const navigate = useNavigate();
	const categoriesQuery = useQuery(fetchCategoriesQueryOptions());
	const tagsQuery = useQuery(fetchTagsQueryOptions());

	const form = useForm({
		defaultValues: {
			title: "",
			content: "",
			status: POST_STATUS.DRAFT,
			coverImage: undefined as CoverImageValue,
			categories: [] as Category[],
			tags: [] as Tag[],
		} as CreatePostFormInput,
		validators: {
			onChange: createPostFormSchema,
			onSubmitAsync: async ({ value }) => {
				try {
					const coverImageUrl =
						value.coverImage instanceof File
							? await putToS3(value.coverImage, "POST")
							: undefined;

					const mediaIds = extractMediaIds(value.content ?? "");

					await createPostMutation.mutateAsync({
						title: value.title,
						content: value.content,
						status: value.status,
						coverImage: coverImageUrl,
						categoryIds: value.categories.map((c) => c.id),
						tagIds: value.tags.map((t) => t.id),
						mediaIds: mediaIds,
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
				<h1 className="text-3xl font-semibold py-2">Create New Post</h1>
			</div>
			<form
				id="create-post-form"
				className="bg-accent px-4 py-4 rounded-md md:px-10 md:py-8 mb-4"
				onSubmit={(e) => {
					e.preventDefault();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
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
										placeholder="New Post Title..."
										autoComplete="off"
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
				</FieldGroup>
			</form>
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
			<div className="flex gap-4">
				<form.Subscribe
					selector={(state) => [state.canSubmit, state.isSubmitting]}
					children={([canSubmit, isSubmitting]) => (
						<div className="flex gap-4 w-full justify-end">
							<Button
								type="button"
								size="lg"
								className="cursor-pointer"
								disabled={!canSubmit || isSubmitting}
								onClick={() => {
									form.setFieldValue("status", POST_STATUS.PUBLISHED);
									form.handleSubmit();
								}}
							>
								Publish
							</Button>

							<Button
								type="button"
								size="lg"
								variant="outline"
								className="cursor-pointer"
								disabled={!canSubmit || isSubmitting}
								onClick={() => {
									form.setFieldValue("status", POST_STATUS.DRAFT);
									form.handleSubmit();
								}}
							>
								Save Draft
							</Button>
						</div>
					)}
				/>
			</div>
		</main>
	);
}
