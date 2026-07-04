import type { Comment, Post, User } from "@/constants/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
	fetchPostCommentsCountQueryOptions,
	fetchPostCommentsQueryOptions,
	useCreateComment,
} from "@/api/commentsApi";
import { PaperPlaneRightIcon } from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CommentItem from "./CommentItem";
import { Link } from "@tanstack/react-router";
import { buildCommentsTree } from "@/lib/utils";

type CommentSectionProps = {
	post: Post;
	user?: User;
};

function CommentSection({ post, user }: CommentSectionProps) {
	const commentsQuery = useInfiniteQuery(
		fetchPostCommentsQueryOptions(post.id),
	);
	const commentsCountQuery = useQuery(
		fetchPostCommentsCountQueryOptions(post.id),
	);
	const [commentInput, setCommentInput] = useState("");
	const createCommentMutation = useCreateComment();

	const handleSubmitComment = () => {
		if (!commentInput.trim()) return;
		createCommentMutation.mutate(
			{ postId: post.id, input: { content: commentInput } },
			{ onSettled: () => setCommentInput("") },
		);
	};

	const comments =
		commentsQuery.data?.pages.flatMap((page) => page.comments) ?? [];

	const commentsTree = useMemo(() => buildCommentsTree(comments), [comments]);

	return (
		<div className="space-y-6">
			<h4 className="font-semibold text-xl">
				Responses ({commentsCountQuery.data?.count.totalComments})
			</h4>

			<div className="space-y-4">
				{user ? (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<Avatar>
								<AvatarImage src={user?.avatar ?? ""} />
								<AvatarFallback>{user?.username}</AvatarFallback>
							</Avatar>
							<p>{user?.username}</p>
							{user?.username === post.author?.username && (
								<Badge>Author</Badge>
							)}
						</div>
						<div className="flex gap-2 items-center">
							<Input
								value={commentInput}
								onChange={(e) => setCommentInput(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSubmitComment()}
								placeholder="Share your thoughts"
							/>
							<Button
								className="cursor-pointer"
								onClick={handleSubmitComment}
								disabled={
									createCommentMutation.isPending || !commentInput.trim()
								}
								size="icon-lg"
							>
								<PaperPlaneRightIcon size={32} weight="fill" />
							</Button>
						</div>
					</div>
				) : (
					<div className="text-center">
						Please
						<Button variant={"link"} className="cursor-pointer text-md" asChild>
							<Link to="/login">SignIn</Link>
						</Button>
						to make a comment
					</div>
				)}
				<Separator />

				<div className="space-y-6">
					{commentsTree.map((comment: Comment) => (
						<CommentItem
							key={comment.id}
							comment={comment}
							post={post}
							currentUser={user}
						/>
					))}
				</div>

				<div className="flex justify-center my-8">
					{commentsQuery.isFetchingNextPage ? (
						<div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
							<div className="h-4 w-4 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
							Loading more comments...
						</div>
					) : commentsQuery.hasNextPage ? (
						<Button onClick={() => commentsQuery.fetchNextPage()}>
							Load more
						</Button>
					) : (
						<p className="text-sm text-muted-foreground font-medium">
							You've reached the end
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default CommentSection;
