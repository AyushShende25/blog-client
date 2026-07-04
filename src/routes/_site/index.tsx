import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import PageSkeleton from "@/components/PageSkeleton";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";
import type { Post } from "@/constants/types";
import { fetchPostsQueryOptions } from "@/api/postsApi";
import { motion } from "motion/react";

export const Route = createFileRoute("/_site/")({
	component: HomeComponent,
	loader: async ({ context }) => {
		await context.queryClient.ensureInfiniteQueryData(
			fetchPostsQueryOptions({}),
		);
	},
	pendingComponent: () => <PageSkeleton />,
});

function HomeComponent() {
	const { data, isFetchingNextPage, hasNextPage, fetchNextPage } =
		useSuspenseInfiniteQuery(fetchPostsQueryOptions({}));

	const { ref, inView } = useInView();
	useEffect(() => {
		if (inView) {
			fetchNextPage();
		}
	}, [fetchNextPage, inView]);

	const allPosts = data?.pages.flatMap((page) => page.posts) || [];

	return (
		<main className="container px-4 sm:px-10 lg:px-14">
			<h1 className="text-4xl md:text-6xl lg:text-7xl py-6 text-center leading-normal">
				<span className="font-bold tracking-tighter block">
					Unleash Your Voice
				</span>
				<span className="font-medium tracking-tighter block">
					Share, Discover, and Inspire.
				</span>
			</h1>
			<p className="space-x-2 text-lg font-semibold text-center">
				<Button asChild>
					<Link to="/signup" search={{ redirect: "/" }}>
						Join Now
					</Link>
				</Button>
				<span>and get Inspired!</span>
			</p>
			<div className="relative h-1 w-full my-10 overflow-hidden rounded-md bg-foreground/20">
				<motion.div
					className="absolute inset-0 bg-linear-to-r 
               from-transparent 
               via-white/40 
               to-transparent"
					initial={{ x: "-100%" }}
					animate={{ x: "100%" }}
					transition={{
						repeat: Infinity,
						duration: 2,
						ease: "linear",
					}}
				/>
			</div>

			<section>
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

				<div className="flex justify-center my-8">
					{isFetchingNextPage ? (
						<div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
							<div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
							Loading more posts...
						</div>
					) : hasNextPage ? (
						<Button onClick={() => fetchNextPage()}>Load Newer</Button>
					) : (
						<p className="text-sm text-muted-foreground font-medium">
							You’ve reached the end
						</p>
					)}
				</div>
			</section>
		</main>
	);
}
