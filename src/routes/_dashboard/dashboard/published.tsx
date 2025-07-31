import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Calendar, Edit, Eye, Trash2 } from "lucide-react";

import { fetchUserPostsQueryOptions } from "@/api/postsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POST_STATUSES, type Post } from "@/constants/types";
import usePostDelete from "@/hooks/usePostDelete";
import { getPlainTextPreview } from "@/lib/utils";

export const Route = createFileRoute("/_dashboard/dashboard/published")({
	component: PublishedPosts,
	loader: async ({ context }) => {
		await context.queryClient.ensureQueryData(
			fetchUserPostsQueryOptions(POST_STATUSES.PUBLISHED),
		);
	},
});

function PublishedPosts() {
	const { data } = useSuspenseQuery(
		fetchUserPostsQueryOptions(POST_STATUSES.PUBLISHED),
	);
	const posts = data?.data ?? [];

	const { deletePostMutation, isPending } = usePostDelete(
		POST_STATUSES.PUBLISHED,
	);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="md:flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Published Posts</h1>
					<p className="text-muted-foreground">
						Manage your published articles and track their performance
					</p>
				</div>
				<Link to="/new-post">
					<Button className="gap-2 mt-3">
						<Edit className="h-4 w-4" />
						<span>New Post</span>
					</Button>
				</Link>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Posts
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{posts.length}</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Views
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">32</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Avg. Views/Post
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">22</div>
					</CardContent>
				</Card>
			</div>

			{/* Posts List */}
			<div className="space-y-4">
				{posts.length === 0 ? (
					<div className="text-center text-muted-foreground">No posts yet.</div>
				) : (
					posts.map((post: Post) => (
						<Card key={post.id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-6">
								<div className="space-y-4 md:flex items-start justify-between gap-4">
									<div className="flex-1 space-y-3">
										<div>
											<h3 className="text-lg font-semibold hover:text-primary">
												{post.title}
											</h3>
											<p className="text-muted-foreground text-sm mt-1 line-clamp-3">
												{getPlainTextPreview(post.content)}
											</p>
										</div>

										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<Calendar className="h-4 w-4" />
												{new Date(post.createdAt).toLocaleDateString()}
											</div>
											<div className="flex items-center gap-1">
												<Eye className="h-4 w-4" />
												{32} views
											</div>
										</div>

										<div className="flex flex-wrap gap-2">
											{post?.categories?.map((cat) => (
												<Badge
													key={cat.id}
													variant="secondary"
													className="text-xs"
												>
													{cat.name}
												</Badge>
											))}
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Link
											to="/post/$postSlug"
											params={{ postSlug: post?.slug }}
										>
											<Button variant="outline" size="sm" className="gap-2">
												<Eye className="h-4 w-4" />
												View
											</Button>
										</Link>
										<Link to="/edit-post/$postId" params={{ postId: post?.id }}>
											<Button variant="outline" size="sm" className="gap-2">
												<Edit className="h-4 w-4" />
												Edit
											</Button>
										</Link>
										<Button
											variant="destructive"
											size="icon"
											disabled={isPending}
											onClick={() => deletePostMutation(post.id)}
										>
											<Trash2 color="#fff" />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
			</div>
		</div>
	);
}
