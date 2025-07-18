import { fetchCategoriesQueryOptions } from "@/api/categoriesApi";
import { postsApi } from "@/api/postsApi";
import { createPostSchema } from "@/constants/schema";
import {
	POST_STATUSES,
	type ApiErrorResponse,
	type Category,
	type Post,
	type POST_STATUS,
} from "@/constants/types";
import { useForm, useStore } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import MultiSelect from "./MultiSelect";
import { Input } from "./ui/input";
import Tiptap from "./Tiptap";
import { imageApi } from "@/api/imageApi";

type PostFormProps = {
	mode: "create" | "edit";
	post?: Post;
	postId?: string;
};

function PostForm({ mode, post, postId }: PostFormProps) {
	const { data: categoriesData } = useQuery(fetchCategoriesQueryOptions());
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const form = useForm({
		defaultValues: {
			title: post?.title || "",
			content: post?.content || "",
			status: post?.status || "DRAFT",
			coverImage: post?.coverImage || undefined,
			categories: post?.categories?.map((cat: Category) => cat.id) || [],
			images: post?.images || [],
		},
		validators: {
			onChange: createPostSchema,
		},
		onSubmit: async ({ value }) => {
			try {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				let res: any;
				if (mode === "create") {
					res = await postsApi.createPost(value);
					await queryClient.invalidateQueries({ queryKey: ["posts"] });
				} else {
					if (!postId) throw new Error("Post ID is required for editing");
					res = await postsApi.updatePost(postId, value);
					await queryClient.invalidateQueries({ queryKey: ["posts"] });
					await queryClient.invalidateQueries({ queryKey: ["post", postId] });
					await queryClient.invalidateQueries({
						queryKey: ["post", res?.data.slug],
					});
				}
				const successMessage =
					mode === "create"
						? "Post created successfully"
						: "Post updated successfully";
				toast.success(successMessage);

				if (res?.data.status === "PUBLISHED") {
					await navigate({ to: `/post/${res?.data.slug}` });
				} else {
					await navigate({ to: "/dashboard/draft" });
				}
			} catch (error) {
				handleFormError(error);
			}
		},
	});

	const handleFormError = (error: unknown) => {
		if (error instanceof AxiosError && error.response?.data) {
			const errorData = error.response.data as ApiErrorResponse;

			if (Array.isArray(errorData.errors)) {
				// biome-ignore lint/complexity/noForEach: <explanation>
				errorData.errors.forEach((err) =>
					form.setErrorMap({
						onSubmit: err.message,
					}),
				);
			} else {
				form.setErrorMap({
					onSubmit: errorData.message,
				});
			}
		} else {
			const defaultMessage =
				mode === "create" ? "Failed to create post" : "Failed to update post";
			form.setErrorMap({
				onSubmit: defaultMessage,
			});
		}
	};

	const handleCoverImageUpload = async (
		e: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("unsupported format");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			toast.error("File size must be less than 5MB");
			return;
		}

		try {
			// Request pre-signed URL
			const { data } = await imageApi.getPresignedUrl(file.name, file.type);
			const { url, fileLink } = data;

			// Upload to S3
			await imageApi.uploadToS3(url, file);

			// Set the cover image URL
			form.setFieldValue("coverImage", fileLink);

			toast.success("Cover image uploaded successfully");
		} catch (error) {
			console.error("Cover image upload error:", error);
			toast.error("Failed to upload cover image");
		}
	};

	const handleRemoveCoverImage = () => {
		form.setFieldValue("coverImage", undefined);
	};

	const handleSubmitStatus = (status: POST_STATUS) => {
		form.setFieldValue("status", status);
	};

	const formErrorMap = useStore(form.store, (state) => state.errorMap);
	const coverImg = useStore(form.store, (state) => state.values.coverImage);

	return (
		<section className="pd-x pd-y">
			<div className="mb-4">
				<h1 className="text-2xl font-bold">
					{mode === "create" ? "Create New Post" : "Edit Post"}
				</h1>
			</div>

			<form
				onSubmit={(e) => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				<div className="shadow rounded">
					<div className="px-6 py-4 bg-card">
						{coverImg && (
							<div className="mb-4 relative inline-block">
								<img
									className="max-w-72 object-cover rounded"
									src={coverImg}
									alt="Cover"
								/>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									className="absolute top-2 right-2"
									onClick={handleRemoveCoverImage}
								>
									Remove
								</Button>
							</div>
						)}

						<div className="flex flex-col md:flex-row gap-2 md:gap-4">
							<Label
								htmlFor="cover-image"
								className="md:mb-6 cursor-pointer bg-muted px-4 py-3 rounded"
							>
								<input
									id="cover-image"
									type="file"
									accept="image/*"
									className="hidden z-20"
									onChange={handleCoverImageUpload}
								/>
								{coverImg ? "Change cover image" : "Add a cover image"}
							</Label>

							<form.Field
								name="categories"
								children={(field) => (
									<MultiSelect<Category>
										options={categoriesData?.data || []}
										selected={
											categoriesData?.data?.filter((cat: Category) =>
												field.state.value.includes(cat.id),
											) ?? []
										}
										onChange={(selected) =>
											field.handleChange(selected.map((c) => c.id))
										}
										labelSelector={(cat) => cat.name}
										valueSelector={(cat) => cat.id}
										placeholder="Select categories"
									/>
								)}
							/>
						</div>

						<form.Field
							name="title"
							children={(field) => (
								<Input
									placeholder={
										mode === "create" ? "New Post Title" : "Post Title"
									}
									className="border-none font-semibold focus-visible:ring-0 text-3xl md:text-4xl h-full shadow-none"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
								/>
							)}
						/>
					</div>

					<div>
						<Tiptap
							key={post?.id || "new"} // Force re-render when switching between posts
							content={post?.content}
							onContentChange={(html) => form.setFieldValue("content", html)}
							onImageChange={(imgSrc) => {
								const current = form.getFieldValue("images") ?? [];
								if (!current.includes(imgSrc)) {
									form.setFieldValue("images", [...current, imgSrc]);
								}
							}}
						/>
					</div>
				</div>

				{/* Form Errors */}
				{(formErrorMap.onChange || formErrorMap.onSubmit) && (
					<div className="my-4 p-3 bg-red-50 border border-red-200 rounded">
						{formErrorMap.onChange && (
							<div className="text-red-600 text-sm">
								Form validation: {formErrorMap.onChange.toString()}
							</div>
						)}
						{formErrorMap.onSubmit && (
							<div className="text-red-600 text-sm">
								{formErrorMap.onSubmit.toString()}
							</div>
						)}
					</div>
				)}

				<div className="my-4 flex flex-wrap gap-2">
					<Button onClick={() => handleSubmitStatus(POST_STATUSES.PUBLISHED)}>
						{mode === "create" ? "Publish" : "Update & Publish"}
					</Button>

					<Button
						onClick={() => handleSubmitStatus(POST_STATUSES.DRAFT)}
						variant="outline"
					>
						Save as draft
					</Button>

					<Button
						type="button"
						variant="ghost"
						onClick={() => navigate({ to: "/dashboard" })}
					>
						Cancel
					</Button>
				</div>
			</form>
		</section>
	);
}
export default PostForm;
