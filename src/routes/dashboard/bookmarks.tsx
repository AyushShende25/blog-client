import { fetchBookmarksQueryOptions, useUnBookmarkPost } from "@/api/postsApi";
import type { Post } from "@/constants/types";
import { EyeIcon, TrashIcon } from "@phosphor-icons/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/bookmarks")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchBookmarksQueryOptions());
	},
});

function RouteComponent() {
	const bookmarksQuery = useSuspenseQuery(fetchBookmarksQueryOptions());
	const savedPosts = bookmarksQuery.data.posts ?? [];
	const unBookmarkMutation = useUnBookmarkPost();

	if (!savedPosts.length) {
		return (
			<div className="flex items-center justify-center h-64 text-muted-foreground">
				No saved posts found.
			</div>
		);
	}

	return (
		<div className="max-w-4xl mx-auto mt-8 px-4">
			<h1 className="text-2xl font-semibold mb-6">Saved Posts</h1>
			<div className="overflow-x-auto rounded-lg shadow">
				<table className="min-w-full text-sm border shadow">
					<thead className="bg-primary/25 text-left">
						<tr>
							<th className="py-3 px-4">Title</th>
							<th className="py-3 px-4">Categories</th>
							<th className="py-3 px-4">Tags</th>
							<th className="py-3 px-4">Actions</th>
						</tr>
					</thead>
					<tbody>
						{bookmarksQuery.data.posts?.map((post: Post) => (
							<tr key={post.id} className="border-t hover:bg-muted transition">
								<td className="py-3 px-4 font-semibold">{post.title}</td>
								<td className="py-3 px-4 space-x-1">
									{post.categories.map((c) => (
										<span key={c.id}>{c.name}</span>
									))}
								</td>
								<td className="py-3 px-4 space-x-1">
									{post.tags.map((t) => (
										<span key={t.id}>#{t.name}</span>
									))}
								</td>
								<td className="py-3 px-4 flex gap-2 items-center">
									<Link to="/posts/$slug" params={{ slug: post.slug }}>
										<EyeIcon size={20} />
									</Link>

									<TrashIcon
										className="cursor-pointer"
										onClick={() => unBookmarkMutation.mutate(post.id)}
										color="red"
										size={20}
									/>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
