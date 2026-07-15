import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Post } from "@/constants/types";
import { ChatCircleDotsIcon, HeartIcon } from "@phosphor-icons/react";
import { getFormattedDate } from "@/lib/utils";
import AuthorInfo from "./AuthorInfo";

function PostCard({ postData }: { postData: Post }) {
	return (
		<Card className="group overflow-hidden h-full  border border-border/50 bg-card transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1.5 hover:border-border py-0 ">
			{/* Cover Image */}
			<Link to="/posts/$slug" params={{ slug: postData.slug }}>
				<div className="relative aspect-video overflow-hidden bg-muted">
					<img
						src={
							postData.coverImage ??
							"https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2938"
						}
						alt={postData.title}
						className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>

					<div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/15 to-transparent" />

					<div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
						{postData.categories.slice(0, 3).map((category) => (
							<span
								key={category.name}
								className="inline-flex items-center rounded-full bg-white/15 backdrop-blur-md border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white tracking-wide uppercase"
							>
								{category.name}
							</span>
						))}
					</div>
				</div>
			</Link>

			<CardContent className=" space-y-3">
				{postData.publishedAt && (
					<p className="text-[11px] text-muted-foreground">
						{getFormattedDate(postData.publishedAt)}
					</p>
				)}
				<Link to="/posts/$slug" params={{ slug: postData.slug }}>
					<h3 className="text-xl font-bold leading-snug line-clamp-2 cursor-pointer transition-colors duration-200 group-hover:text-primary">
						{postData.title}
					</h3>
				</Link>

				<p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
					{postData.excerpt}
				</p>

				<div className="space-x-1 wrap-break-word">
					{postData.tags.map((t) => (
						<span key={t.id}>#{t.name}</span>
					))}
				</div>
			</CardContent>
			<CardFooter className="flex items-center justify-between">
				{postData.author && <AuthorInfo author={postData.author} />}

				<div className="flex items-center gap-3 text-muted-foreground">
					<div className="flex items-center gap-1 text-[11px]">
						<HeartIcon size={20} />
						<span>{postData._count.likes}</span>
					</div>
					<div className="flex items-center gap-1 text-[11px]">
						<ChatCircleDotsIcon size={20} />
						<span>{postData._count.comments}</span>
					</div>
				</div>
			</CardFooter>
		</Card>
	);
}

export default PostCard;
