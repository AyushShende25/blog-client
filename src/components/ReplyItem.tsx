import type { Comment, User } from "@/constants/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
	useCreateComment,
	useDeleteComment,
	useUpdateComment,
} from "@/api/commentsApi";
import {
	CheckIcon,
	PencilSimpleIcon,
	TrashIcon,
	XIcon,
} from "@phosphor-icons/react";

import { Input } from "@/components/ui/input";
import { dateFormatter } from "@/lib/utils";

type ReplyItemProps = {
	reply: Comment;
	postId: string;
	rootCommentId: string;
	currentUser?: User;
};

function ReplyItem({
	reply,
	postId,
	rootCommentId,
	currentUser,
}: ReplyItemProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [editInput, setEditInput] = useState(reply.content);
	const [replyInputOpen, setReplyInputOpen] = useState(false);
	const [replyInput, setReplyInput] = useState("");

	const createCommentMutation = useCreateComment();
	const updateCommentMutation = useUpdateComment();
	const deleteCommentMutation = useDeleteComment();

	const isOwner = currentUser?.id === reply.authorId;

	const handleSaveEdit = () => {
		if (!editInput.trim() || editInput === reply.content) {
			setIsEditing(false);
			return;
		}
		updateCommentMutation.mutate(
			{ commentId: reply.id, postId, content: editInput },
			{ onSettled: () => setIsEditing(false) },
		);
	};

	const handleSubmitReply = () => {
		const content = replyInput.trim();
		if (!content || reply.isDeleted) return;
		createCommentMutation.mutate(
			{
				postId,
				input: {
					content,
					parentId: rootCommentId,
				},
			},
			{
				onSettled: () => {
					setReplyInputOpen(false);
					setReplyInput(`@${reply.author.username} `);
				},
			},
		);
	};

	return (
		<div className="space-y-2">
			<div className="flex justify-between gap-2">
				<div className="flex gap-2">
					<Avatar className="h-7 w-7">
						<AvatarImage
							src={reply.isDeleted ? "/deleted.png" : reply.author.avatar}
						/>
						<AvatarFallback>
							{reply.isDeleted ? "[deleted]" : reply.author.username}
						</AvatarFallback>
					</Avatar>
					<div>
						<p className="font-semibold text-sm leading-tight">
							{reply.isDeleted ? "[deleted]" : reply.author.username}
						</p>
						<p className="text-xs text-muted-foreground">
							{dateFormatter.format(new Date(reply.createdAt))}
						</p>
					</div>
				</div>
				{isOwner && !reply.isDeleted && (
					<div className="flex gap-1 items-start">
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6"
							onClick={() => {
								setEditInput(reply.content);
								setIsEditing(true);
							}}
						>
							<PencilSimpleIcon size={13} />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-destructive hover:text-destructive"
							onClick={() =>
								deleteCommentMutation.mutate({ commentId: reply.id, postId })
							}
							disabled={deleteCommentMutation.isPending}
						>
							<TrashIcon size={13} />
						</Button>
					</div>
				)}
			</div>

			{isEditing ? (
				<div className="flex gap-2 items-center ml-9">
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
						<CheckIcon size={14} />
					</Button>
					<Button
						size="icon"
						variant="ghost"
						onClick={() => setIsEditing(false)}
					>
						<XIcon size={14} />
					</Button>
				</div>
			) : (
				<p className="ml-9 text-sm">
					{" "}
					{reply.isDeleted ? (
						<span className="text-muted-foreground">deleted comment</span>
					) : (
						reply.content
					)}
				</p>
			)}

			{currentUser && !isEditing && !reply.isDeleted && (
				<div className="ml-9">
					{replyInputOpen ? (
						<div className="space-y-2">
							<Input
								value={replyInput}
								onChange={(e) => setReplyInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") handleSubmitReply();
									if (e.key === "Escape") setReplyInputOpen(false);
								}}
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
									disabled={
										createCommentMutation.isPending || !replyInput.trim()
									}
									className="cursor-pointer"
								>
									Submit
								</Button>
							</div>
						</div>
					) : (
						<Button
							className="cursor-pointer h-auto p-0 text-xs underline"
							variant="link"
							onClick={() => {
								if (reply.isDeleted) return;
								setReplyInput(`@${reply.author.username} `);
								setReplyInputOpen(true);
							}}
						>
							Reply
						</Button>
					)}
				</div>
			)}
		</div>
	);
}

export default ReplyItem;
