import {
	useCreateComment,
	useDeleteComment,
	useUpdateComment,
} from "@/api/commentsApi";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
	CheckIcon,
	PencilSimpleIcon,
	TrashIcon,
	XIcon,
} from "@phosphor-icons/react";
import { dateFormatter } from "@/lib/utils";
import type { Post, User, Comment } from "@/constants/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

type CommentItemProps = {
	comment: Comment;
	post: Post;
	currentUser?: User;
};

function CommentItem({ comment, post, currentUser }: CommentItemProps) {
	const [replyInputOpen, setReplyInputOpen] = useState(false);
	const [replyInput, setReplyInput] = useState("");
	const [isEditing, setIsEditing] = useState(false);
	const [editInput, setEditInput] = useState(comment.content);

	const createCommentMutation = useCreateComment();
	const updateCommentMutation = useUpdateComment();
	const deleteCommentMutation = useDeleteComment();

	const isOwner = currentUser?.id === comment.authorId;

	const handleSubmitReply = () => {
		if (!replyInput.trim() || comment.isDeleted) return;
		createCommentMutation.mutate(
			{
				postId: post.id,
				input: { content: replyInput, parentId: comment.id },
			},
			{
				onSettled: () => {
					setReplyInputOpen(false);
					setReplyInput("");
				},
			},
		);
	};

	const handleSaveEdit = () => {
		if (!editInput.trim() || editInput === comment.content) {
			setIsEditing(false);
			return;
		}
		updateCommentMutation.mutate(
			{ commentId: comment.id, postId: post.id, content: editInput },
			{ onSettled: () => setIsEditing(false) },
		);
	};

	const handleDelete = () => {
		deleteCommentMutation.mutate({ commentId: comment.id, postId: post.id });
	};

	return (
		<div className="space-y-3">
			<div className="flex gap-4 justify-between">
				<div className="flex gap-3">
					<Avatar>
						<AvatarImage
							src={
								comment.isDeleted
									? "/deleted.png"
									: (comment.avatar ?? "/default-avatar.png")
							}
						/>
						<AvatarFallback>
							{comment.isDeleted ? "[deleted]" : comment.username}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-semibold text-base leading-tight">
							{comment.isDeleted ? "[deleted]" : comment.username}
						</p>
						<p className="text-xs text-muted-foreground">
							{dateFormatter.format(new Date(comment.createdAt))}
						</p>
					</div>
				</div>

				{isOwner && !comment.isDeleted && (
					<div className="flex gap-1 items-start">
						<Button
							variant="ghost"
							size="icon"
							className="cursor-pointer h-7 w-7"
							onClick={() => {
								setEditInput(comment.content);
								setIsEditing(true);
							}}
						>
							<PencilSimpleIcon size={15} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="cursor-pointer h-7 w-7 text-destructive hover:text-destructive"
							onClick={handleDelete}
							disabled={deleteCommentMutation.isPending}
						>
							<TrashIcon size={15} />
						</Button>
					</div>
				)}
			</div>

			{isEditing ? (
				<div className="flex gap-2 items-center ml-10">
					<Input
						value={editInput}
						onChange={(e) => setEditInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSaveEdit();
							if (e.key === "Escape") setIsEditing(false);
						}}
						autoFocus
					/>
					<Button
						size="icon"
						variant="ghost"
						onClick={handleSaveEdit}
						disabled={updateCommentMutation.isPending}
					>
						<CheckIcon size={16} />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setIsEditing(false)}
					>
						<XIcon size={16} />
					</Button>
				</div>
			) : (
				<p className="ml-10 text-sm">
					{comment.isDeleted ? (
						<span className="text-muted-foreground">deleted comment</span>
					) : (
						comment.content
					)}
				</p>
			)}

			<div className="ml-10 flex items-center gap-3">
				{currentUser && !comment.isDeleted && (
					<Button
						className="cursor-pointer h-auto p-0 text-xs underline"
						variant="link"
						onClick={() => {
							if (!comment.isDeleted) setReplyInputOpen((v) => !v);
						}}
					>
						Reply
					</Button>
				)}
			</div>

			{replyInputOpen && !comment.isDeleted && (
				<div className="ml-10 space-y-2">
					<Input
						placeholder="Type your reply here"
						value={replyInput}
						onChange={(e) => setReplyInput(e.target.value)}
						onKeyDown={(e) => e.key === "Enter" && handleSubmitReply()}
						autoFocus
					/>
					<div className="flex gap-2">
						<Button
							variant="secondary"
							size="sm"
							onClick={() => setReplyInputOpen(false)}
							className="cursor-pointer"
						>
							Cancel
						</Button>
						<Button
							size="sm"
							onClick={handleSubmitReply}
							disabled={createCommentMutation.isPending || !replyInput.trim()}
							className="cursor-pointer"
						>
							Submit
						</Button>
					</div>
				</div>
			)}
			{comment.replies?.length > 0 && (
				<div className="ml-10 border-l pl-4 space-y-4">
					{comment.replies.map((reply) => (
						<CommentItem
							key={reply.id}
							comment={reply}
							post={post}
							currentUser={currentUser}
						/>
					))}
				</div>
			)}
		</div>
	);
}

export default CommentItem;
