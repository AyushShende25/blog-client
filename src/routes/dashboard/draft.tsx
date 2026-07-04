import { fetchMyPostsQueryOptions, useDeletePost } from "@/api/postsApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type Post, POST_STATUS } from "@/constants/types";
import {
	ClockCounterClockwiseIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const Route = createFileRoute("/dashboard/draft")({
	component: RouteComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchMyPostsQueryOptions({ status: POST_STATUS.DRAFT }),
		);
	},
});

function RouteComponent() {
	const draftsQuery = useSuspenseInfiniteQuery(
		fetchMyPostsQueryOptions({ status: POST_STATUS.DRAFT }),
	);
	const { ref, inView } = useInView();

	useEffect(() => {
		if (inView) {
			draftsQuery.fetchNextPage();
		}
	}, [draftsQuery.fetchNextPage, draftsQuery.hasNextPage, inView]);

	const drafts = draftsQuery.data?.pages.flatMap((page) => page.posts) || [];

	const deletePostMutation = useDeletePost();
	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="md:flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Drafts</h1>
					<p className="text-muted-foreground">
						Continue working on your unpublished posts
					</p>
				</div>
				<Link to="/posts/new">
					<Button className="gap-2 mt-3 cursor-pointer">
						<PlusIcon size={20} />
						New Draft
					</Button>
				</Link>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<div className="text-sm text-muted-foreground">Total Drafts</div>
						<div className="text-2xl font-bold">{drafts.length}</div>
					</CardContent>
				</Card>
			</div>

			{/* Drafts List */}
			<div className="space-y-4">
				{drafts.map((draft: Post) => (
					<Card
						key={draft.id}
						className="hover:shadow-md transition-all duration-200"
					>
						<CardContent className="p-6">
							<div className="md:flex items-start justify-between space-y-6 gap-6">
								<div className="flex-1 space-y-4">
									<div className="space-y-3">
										<h3 className="text-lg font-semibold">{draft.title}</h3>
										<p className="text-muted-foreground text-sm  line-clamp-3">
											{draft.excerpt}
										</p>
									</div>

									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<ClockCounterClockwiseIcon size={20} />
										<span>
											Last edited{" "}
											{new Date(draft.updatedAt).toLocaleDateString()}
										</span>
									</div>
								</div>

								<div className="flex items-center gap-2">
									<Link to="/posts/edit/$id" params={{ id: draft?.id }}>
										<Button
											variant="outline"
											size="sm"
											className="gap-2 cursor-pointer"
										>
											<PencilIcon />
											Edit
										</Button>
									</Link>
									<Button
										variant="destructive"
										size="icon"
										className="cursor-pointer"
										disabled={deletePostMutation.isPending}
										onClick={() => deletePostMutation.mutate(draft.id)}
									>
										<TrashIcon />
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				))}
				<div ref={ref} />

				<div className="flex justify-center my-8">
					{draftsQuery.isFetchingNextPage ? (
						<div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
							<div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
							Loading more posts...
						</div>
					) : draftsQuery.hasNextPage ? (
						<Button onClick={() => draftsQuery.fetchNextPage()}>
							Load Newer
						</Button>
					) : null}
				</div>
			</div>

			{drafts.length === 0 && (
				<Card>
					<CardContent className="p-12 text-center">
						<PencilIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No drafts yet</h3>
						<p className="text-muted-foreground mb-4">
							Start writing your first draft to see it here
						</p>
						<Link to="/posts/new">
							<Button size={"lg"} className="cursor-pointer">
								Create New Draft
							</Button>
						</Link>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
