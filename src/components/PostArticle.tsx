import type { Post, User } from "@/constants/types";
import { getFormattedDate } from "@/lib/utils";
import { BookmarkSimpleIcon, HeartIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import {
	fetchBookmarksQueryOptions,
	useBookmarkPost,
	useUnBookmarkPost,
} from "@/api/postsApi";
import {
	fetchLikesCountQueryOptions,
	fetchLikeStatusQueryOptions,
	useCreateLike,
	useRemoveLike,
} from "@/api/likesApi";
import { Link } from "@tanstack/react-router";
import { defaultBlogSearch } from "@/constants";
import AuthorInfo from "./AuthorInfo";

type PostArticleProps = {
	post: Post;
	user?: User;
};

function PostArticle({ post, user }: PostArticleProps) {
	const bookmarkQuery = useQuery(fetchBookmarksQueryOptions());
	const isBookmarked = bookmarkQuery.data?.posts?.some((p) => p.id === post.id);

	const bookmarkPostMutation = useBookmarkPost();
	const unbookmarkPostMutation = useUnBookmarkPost();

	const likeStatusQuery = useQuery(fetchLikeStatusQueryOptions(post.id));
	const likeCountQuery = useQuery(fetchLikesCountQueryOptions(post.id));
	const likePostMutation = useCreateLike();
	const unLikePostMutation = useRemoveLike();

	const handleToggleSave = () => {
		if (isBookmarked) {
			unbookmarkPostMutation.mutate(post.id);
		} else {
			bookmarkPostMutation.mutate(post.id);
		}
	};

	const handleToggleLike = () => {
		if (likeStatusQuery.data?.hasLiked) {
			unLikePostMutation.mutate(post.id);
		} else {
			likePostMutation.mutate(post.id);
		}
	};

	return (
		<article className="space-y-8 md:space-y-12">
			{post.coverImage && (
				<div className="mb-10 md:mb-12 lg:mb-16 flex justify-center">
					<img
						src={post.coverImage}
						alt={post.title}
						className="w-full max-w-3xl max-h-60 md:max-h-100 lg:max-h-125 object-cover"
					/>
				</div>
			)}

			<div className="space-y-6">
				<h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight font-semibold">
					{post.title}
				</h1>

				<div className="flex items-center gap-4">
					<div className="w-full flex justify-between items-center">
						<div className="space-y-2">
							{post.author && <AuthorInfo author={post.author} />}
							{post.publishedAt && (
								<p className="text-[11px] text-muted-foreground">
									{getFormattedDate(post.publishedAt)}
								</p>
							)}
						</div>
						<div>
							{user && (
								<button
									type="button"
									onClick={handleToggleSave}
									className="cursor-pointer"
								>
									<BookmarkSimpleIcon
										size={32}
										weight={isBookmarked ? "fill" : "light"}
									/>
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

			<div
				className="prose dark:prose-invert prose-sm sm:prose-lg max-w-none"
				dangerouslySetInnerHTML={{ __html: post.content }}
			/>

			<div className="flex gap-4 items-center justify-center">
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handleToggleLike}
						className="cursor-pointer"
					>
						<HeartIcon
							size={25}
							weight={likeStatusQuery.data?.hasLiked ? "fill" : "light"}
						/>
					</button>
					<span className="text-lg">{likeCountQuery.data?.count}</span>
				</div>
				{post.categories.map((c) => (
					<Link
						to="/posts/search"
						key={c.id}
						search={{ ...defaultBlogSearch, category: c.name }}
					>
						<Badge className="cursor-pointer" variant="secondary">
							{c.name}
						</Badge>
					</Link>
				))}
				{post.tags.map((t) => (
					<Link
						key={t.id}
						to="/posts/search"
						search={{
							...defaultBlogSearch,
							tag: t.name,
						}}
					>
						<Badge className="cursor-pointer" variant="outline">
							#{t.name}
						</Badge>
					</Link>
				))}
			</div>
		</article>
	);
}

export default PostArticle;
