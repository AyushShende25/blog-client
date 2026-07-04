import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll } from "motion/react";
import { fetchPostQueryOptions } from "@/api/postsApi";
import { userQueryOptions } from "@/api/authApi";
import { Separator } from "@/components/ui/separator";
import PostArticle from "@/components/PostArticle";
import AuthorCard from "@/components/AuthorCard";
import CommentSection from "@/components/CommentSection";

export const Route = createFileRoute("/_site/posts/$slug")({
	component: RouteComponent,
	loader: async ({ context, params }) => {
		return await context.queryClient.ensureQueryData(
			fetchPostQueryOptions(params.slug),
		);
	},
});

function RouteComponent() {
	const { scrollYProgress } = useScroll();
	const { slug } = Route.useParams();

	const postQuery = useSuspenseQuery(fetchPostQueryOptions(slug));
	const userQuery = useQuery(userQueryOptions());

	const post = postQuery.data.post;
	const user = userQuery.data?.user;

	return (
		<main className="container px-4 sm:px-10 lg:px-14 py-6 md:py-10 space-y-10">
			<motion.div
				id="scroll-indicator"
				style={{ scaleX: scrollYProgress, originX: 0 }}
				className="fixed top-0 left-0 right-0 h-2 z-50 rounded bg-linear-to-r from-neutral-900 to-neutral-300"
			/>

			<PostArticle post={post} user={user} />

			<section className="space-y-6">
				<AuthorCard post={post} user={user} />
				<Separator />
				<CommentSection post={post} user={user} />
			</section>
		</main>
	);
}
