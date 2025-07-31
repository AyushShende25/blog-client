import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Eye, Trash2 } from "lucide-react";

import { fetchSavedPostsQueryOptions } from "@/api/userApi";
import type { SavedPost } from "@/constants/types";
import useUnsavePost from "@/hooks/useUnsavePost";

export const Route = createFileRoute("/_dashboard/dashboard/library")({
	component: Library,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(fetchSavedPostsQueryOptions());
	},
});

function Library() {
	const { data } = useSuspenseQuery(fetchSavedPostsQueryOptions());
	const savedPosts = data?.data ?? [];
	const { unsavePostMutation } = useUnsavePost();

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
					<thead className="bg-gray-100 text-left">
						<tr>
							<th className="py-3 px-4">Title</th>
							<th className="py-3 px-4">Cover</th>
							<th className="py-3 px-4">Actions</th>
						</tr>
					</thead>
					<tbody>
						{savedPosts.map((post: SavedPost) => (
							<tr key={post.id} className="border-t hover:bg-muted transition">
								<td className="py-3 px-4 font-semibold">{post.title}</td>
								<td className="py-3 px-4">
									{post.coverImage ? (
										<img
											src={post.coverImage}
											alt={post.title}
											className="w-16 h-16 object-cover rounded"
										/>
									) : (
										<span className="text-muted-foreground italic">
											No image
										</span>
									)}
								</td>
								<td className="py-3 px-4 flex gap-2 items-center">
									<Link to="/post/$postSlug" params={{ postSlug: post.slug }}>
										<Eye size={20} />
									</Link>

									<Trash2
										className="cursor-pointer"
										onClick={() => unsavePostMutation(post.id)}
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
