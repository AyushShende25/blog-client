import { createFileRoute } from "@tanstack/react-router";

import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_layout/")({
	component: HomeComponent,
});

function HomeComponent() {
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
				<Button>Join Now</Button> <span>and get Inspired!</span>
			</p>
			<div className="h-1 bg-foreground w-full my-10" />

			<section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 ">
				<PostCard />
				<PostCard />
				<PostCard />
				<PostCard />
				<PostCard />
				<PostCard />
				<PostCard />
			</section>
		</section>
	);
}
