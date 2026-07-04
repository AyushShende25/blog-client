import { userQueryOptions } from "@/api/authApi";
import {
	type CreatePostFormInput,
	createPostFormSchema,
} from "@/constants/schema";
import { type Category, POST_STATUS, type Tag } from "@/constants/types";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
	Field,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCategoriesQueryOptions } from "@/api/categoriesApi";
import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxList,
	ComboboxValue,
	useComboboxAnchor,
} from "@/components/ui/combobox";
import { fetchTagsQueryOptions, tagKeys, tagsApi } from "@/api/tagsApi";
import { useRef, useState } from "react";
import Editor from "@/components/text-editor/Editor";
import { useCreatePost } from "@/api/postsApi";
import { putToS3 } from "@/api/mediaApi";
import { FilePlusIcon, XIcon } from "@phosphor-icons/react";

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
	const mediaIdsRef = useRef<string[]>([]); // used useRef instead of useState because we don't use media-ids in the jsx, so ref gives us persistent mutable container across rerenders and doesn't cause rerender on mutating.
	const queryClient = useQueryClient();
	const createPostMutation = useCreatePost();
	const navigate = useNavigate();
	const form = useForm({
		defaultValues: {
			title: "",
			content: "",
			status: POST_STATUS.DRAFT,
			coverImage: undefined as File | undefined,
			categories: [] as Category[],
			tags: [] as Tag[],
		} as CreatePostFormInput,
		validators: {
			onSubmit: createPostFormSchema,
		},
		onSubmit: async ({ value }) => {
			const coverImageUrl = value.coverImage
				? await putToS3(value.coverImage, "POST")
				: undefined;

			await createPostMutation.mutateAsync(
				{
					title: value.title,
					content: value.content,
					status: value.status,
					coverImage: coverImageUrl,
					categories: value.categories.map((c) => c.id),
					tags: value.tags.map((t) => t.id),
					media: mediaIdsRef.current,
				},
				{
					onSuccess: () => {
						navigate({
							to:
								value.status === "PUBLISHED"
									? "/dashboard/published"
									: "/dashboard/draft",
						});
					},
				},
			);
		},
	});

	const { data: categoriesData } = useQuery(fetchCategoriesQueryOptions());
	const { data: tagsData } = useQuery(fetchTagsQueryOptions());
	const tags = tagsData?.tags;
	const categories = categoriesData?.categories;

	const categoriesAnchor = useComboboxAnchor();
	const tagsAnchor = useComboboxAnchor();

	const [tagQuery, setTagQuery] = useState("");
	const normalizedQuery = tagQuery.trim().toLowerCase();

	const tagExists = tags?.some((tag) => tag.name === normalizedQuery) ?? false;

	const filteredTags = tags
		? tagQuery
			? tags?.filter((tag) => tag.name.includes(normalizedQuery))
			: tags
		: [];

	const handleCreateTag = async (field: any) => {
		if (!normalizedQuery) return;

		const exists = field.state.value.some(
			(t: Tag) => t.name.toLowerCase() === normalizedQuery,
		);

		if (exists) return;
		if (field.state.value.length >= 5) return;
		const { tag: newTag } = await tagsApi.createTag({ name: normalizedQuery });
		queryClient.setQueryData(tagKeys.all, (old: Tag[] = []) => [
			...old,
			newTag,
		]);

		field.handleChange([...field.state.value, newTag]);

		setTagQuery("");
	};

	const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

	const handleCoverImageChange = async (
		e: React.ChangeEvent<HTMLInputElement>,
		setFile: (f: File | undefined) => void,
	) => {
		const file = e.target.files?.[0];
		e.target.value = "";
		if (!file) return;

		if (coverPreviewUrl?.startsWith("blob:")) {
			URL.revokeObjectURL(coverPreviewUrl);
		}
		setCoverPreviewUrl(URL.createObjectURL(file));
		setFile(file);
	};

	const removeCoverImage = (setFile: (f: File | undefined) => void) => {
		if (coverPreviewUrl?.startsWith("blob:")) {
			URL.revokeObjectURL(coverPreviewUrl);
		}
		setCoverPreviewUrl(null);
		setFile(undefined);
	};

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
									{coverPreviewUrl ? (
										<div className="relative w-fit">
											<img
												src={coverPreviewUrl}
												alt="Cover preview"
												className="h-40 rounded-md object-cover"
											/>
											<Button
												type="button"
												size="icon"
												variant="destructive"
												className="absolute -top-2 -right-2 size-6"
												onClick={() => removeCoverImage(field.handleChange)}
											>
												<XIcon className="size-3" />
											</Button>
										</div>
									) : (
										<>
											<FieldLabel
												className="px-3 py-3 cursor-pointer rounded-sm min-h-10 border border-input bg-background hover:bg-background/50 transition-colors duration-300"
												htmlFor={field.name}
											>
												<FilePlusIcon size={32} />
											</FieldLabel>
											<Input
												id={field.name}
												name={field.name}
												onBlur={field.handleBlur}
												onChange={(e) =>
													handleCoverImageChange(e, field.handleChange)
												}
												aria-invalid={isInvalid}
												type="file"
												accept="image/*"
												className="hidden z-20"
											/>
										</>
									)}

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
									<Field data-invalid={isInvalid} className="h-full">
										<Combobox
											aria-invalid={isInvalid}
											multiple
											autoHighlight
											items={categories ?? []}
											value={field.state.value}
											onValueChange={(vals) => {
												if (vals.length <= 3) field.handleChange(vals);
											}}
										>
											<ComboboxChips
												ref={categoriesAnchor}
												className="w-full h-full min-h-10 bg-transparent dark:bg-transparent border-none focus-visible:ring-0 shadow-none focus-within:ring-0"
											>
												<ComboboxValue>
													{(values: Category[]) => (
														<>
															{values.map((item: Category) => (
																<ComboboxChip key={item.id}>
																	{item.name}
																</ComboboxChip>
															))}
															<ComboboxChipsInput placeholder="Add upto 3 categories..." />
														</>
													)}
												</ComboboxValue>
											</ComboboxChips>
											<ComboboxContent anchor={categoriesAnchor}>
												<ComboboxEmpty>No categories found.</ComboboxEmpty>
												<ComboboxList>
													{(item: Category) => (
														<ComboboxItem key={item.id} value={item}>
															{item.name}
														</ComboboxItem>
													)}
												</ComboboxList>
											</ComboboxContent>
										</Combobox>
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
										<Combobox
											aria-invalid={isInvalid}
											multiple
											autoHighlight
											items={filteredTags ?? []}
											value={field.state.value}
											onValueChange={(vals: Tag[]) => {
												if (vals.length <= 5) {
													field.handleChange(vals);
													setTagQuery("");
												}
											}}
										>
											<ComboboxChips
												ref={tagsAnchor}
												className="w-full h-full min-h-10 bg-transparent dark:bg-transparent border-none focus-visible:ring-0 shadow-none focus-within:ring-0"
											>
												<ComboboxValue>
													{(values: Tag[]) => {
														return (
															<>
																{values.map((item: Tag) => (
																	<ComboboxChip key={item?.id}>
																		{item?.name}
																	</ComboboxChip>
																))}
																<ComboboxChipsInput
																	placeholder="Add up to 5 tags..."
																	value={tagQuery}
																	onChange={(e) => setTagQuery(e.target.value)}
																	onKeyDown={(e) => {
																		if (
																			e.key === "Enter" &&
																			tagQuery &&
																			!tagExists
																		) {
																			e.preventDefault();
																			handleCreateTag(field);
																		}
																	}}
																/>
															</>
														);
													}}
												</ComboboxValue>
											</ComboboxChips>
											<ComboboxContent anchor={tagsAnchor}>
												<ComboboxEmpty>No tags found.</ComboboxEmpty>

												<ComboboxList>
													{(item: Tag) => (
														<ComboboxItem key={item.id} value={item}>
															{item.name}
														</ComboboxItem>
													)}
												</ComboboxList>
												{tagQuery &&
													!tagExists &&
													field.state.value.length < 5 && (
														<ComboboxItem
															onMouseDown={(e) => {
																e.preventDefault();
																e.stopPropagation();
															}}
															onClick={async () => {
																await handleCreateTag(field);
															}}
														>
															Create "{tagQuery}"
														</ComboboxItem>
													)}
											</ComboboxContent>
										</Combobox>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</div>
					<div>
						<form.Field
							name="content"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<Editor
											value={field.state.value}
											onChange={(html) => field.handleChange(html)}
											onImageUpload={(mediaId) => {
												mediaIdsRef.current = [...mediaIdsRef.current, mediaId];
											}}
										/>

										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</div>
				</FieldGroup>
			</form>
			<div className="flex gap-4">
				<Button
					type="button"
					size="lg"
					className="cursor-pointer"
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
					className="cursor-pointer"
					variant="outline"
					onClick={() => {
						form.setFieldValue("status", POST_STATUS.DRAFT);
						form.handleSubmit();
					}}
				>
					Save Draft
				</Button>
			</div>
		</main>
	);
}
