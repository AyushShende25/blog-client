import { userQueryOptions } from "@/api/authApi";
import {
	fetchMyPostsQueryOptions,
	fetchUserPostStatsQueryOptions,
	useDeletePost,
} from "@/api/postsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { POST_STATUS, type Post } from "@/constants/types";
import {
	CalendarBlankIcon,
	EyeIcon,
	PencilSimpleIcon,
	PlusIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useQuery, useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const Route = createFileRoute("/dashboard/published")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchMyPostsQueryOptions({ status: POST_STATUS.PUBLISHED }),
		);
	},
});

function RouteComponent() {
	const userQuery = useQuery(userQueryOptions());

	const postsQuery = useSuspenseInfiniteQuery(
		fetchMyPostsQueryOptions({ status: POST_STATUS.PUBLISHED }),
	);

	const statsQuery = useQuery(
		fetchUserPostStatsQueryOptions(userQuery.data?.user.username),
	);

	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView) {
			postsQuery.fetchNextPage();
		}
	}, [postsQuery.fetchNextPage, postsQuery.hasNextPage, inView]);

	const posts = postsQuery.data?.pages.flatMap((page) => page.posts) || [];

	const deletePostMutation = useDeletePost();

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
				<Link to="/posts/new">
					<Button className="gap-2 mt-3 cursor-pointer">
						<PlusIcon size={20} />
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
						<div className="text-2xl font-bold">
							{statsQuery.data?.count.posts}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Likes
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsQuery.data?.count.likes}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total Comments
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{statsQuery.data?.count.comments}
						</div>
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
									<div className="flex-1 space-y-4">
										<div className="space-y-3">
											<h3 className="text-lg font-semibold hover:text-primary">
												{post.title}
											</h3>
											<p className="text-muted-foreground text-sm mt-1 line-clamp-3">
												{post.excerpt}
											</p>
										</div>

										<div className="flex items-center gap-4 text-sm text-muted-foreground">
											<div className="flex items-center gap-1">
												<CalendarBlankIcon size={20} />
												{new Date(post.createdAt).toLocaleDateString()}
											</div>
											<div className="flex items-center gap-1">
												<EyeIcon size={20} />
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
											{post?.tags?.map((tag) => (
												<Badge
													key={tag.id}
													variant="outline"
													className="text-xs"
												>
													#{tag.name}
												</Badge>
											))}
										</div>
									</div>

									<div className="flex items-center gap-2">
										<Link to="/posts/$slug" params={{ slug: post?.slug }}>
											<Button
												variant="outline"
												size="sm"
												className="gap-2 cursor-pointer"
											>
												<EyeIcon size={20} />
												View
											</Button>
										</Link>
										<Link to="/posts/edit/$id" params={{ id: post?.id }}>
											<Button
												variant="outline"
												size="sm"
												className="gap-2 cursor-pointer"
											>
												<PencilSimpleIcon size={20} />
												Edit
											</Button>
										</Link>
										<Button
											variant="destructive"
											size="icon"
											className="cursor-pointer"
											disabled={deletePostMutation.isPending}
											onClick={() => deletePostMutation.mutate(post.id)}
										>
											<TrashIcon size={20} />
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					))
				)}
				<div ref={ref} />

				<div className="flex justify-center my-8">
					{postsQuery.isFetchingNextPage ? (
						<div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
							<div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
							Loading more posts...
						</div>
					) : postsQuery.hasNextPage ? (
						<Button onClick={() => postsQuery.fetchNextPage()}>
							Load Newer
						</Button>
					) : (
						<p className="text-sm text-muted-foreground font-medium">
							You’ve reached the end
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
