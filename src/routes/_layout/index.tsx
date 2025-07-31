import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

import { fetchPostListQueryOptions } from "@/api/postsApi";
import FeaturedCategories from "@/components/FeaturedCategories";
import PageSkeleton from "@/components/PageSkeleton";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import type { Post } from "@/constants/types";

export const Route = createFileRoute("/_layout/")({
	component: HomeComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchPostListQueryOptions(),
		);
	},
	pendingComponent: () => <PageSkeleton />,
});

function HomeComponent() {
	const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useSuspenseInfiniteQuery(fetchPostListQueryOptions());

	const { ref, inView } = useInView();
	useEffect(() => {
		if (inView) {
			fetchNextPage();
		}
	}, [fetchNextPage, inView]);
	const allPosts = data?.pages.flatMap((page) => page.data) || [];

	return (
		<section className="pd-x pd-y">
			<h1 className="text-5xl md:text-6xl lg:text-7xl  tracking-wider py-6 text-center">
				<span className="font-extrabold leading-relaxed">
					Unleash Your Voice:{" "}
				</span>
				<span className="font-semibold leading-relaxed">
					Share, Discover, and Inspire.
				</span>
			</h1>
			<p className="space-x-4 text-lg font-semibold text-center">
				<Button>
					<Link to="/signup">Join Now</Link>
				</Button>{" "}
				<span>and get Inspired!</span>
			</p>
			<div className="h-1 bg-foreground w-full my-10" />

			<section>
				<FeaturedCategories />
				{allPosts.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
						{allPosts.map((post: Post) => (
							<PostCard key={post.id} postData={post} />
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<p className="text-muted-foreground text-lg">
							No posts available yet.
						</p>
					</div>
				)}

				<div ref={ref} />

				<p className="bg-muted my-4 py-4 rounded-lg text-center font-semibold">
					{isFetchingNextPage
						? "Loading more..."
						: hasNextPage
							? "Load Newer"
							: "Nothing more to load"}
				</p>
			</section>
		</section>
	);
}
