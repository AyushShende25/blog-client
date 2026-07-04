import type { Comment, User } from "@/constants/types";
import { Button } from "@/components/ui/button";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { fetchRepliesQueryOptions } from "@/api/commentsApi";
import ReplyItem from "./ReplyItem";

type RepliesListProps = {
	rootCommentId: string;
	postId: string;
	currentUser?: User;
};

function RepliesList({ rootCommentId, postId, currentUser }: RepliesListProps) {
	const repliesQuery = useSuspenseInfiniteQuery(
		fetchRepliesQueryOptions(rootCommentId),
	);

	return (
		<div className="space-y-4">
			{repliesQuery.data.pages.map((page, i) => (
				<div key={i} className="space-y-4">
					{page.replies.map((reply: Comment) => (
						<ReplyItem
							key={reply.id}
							reply={reply}
							postId={postId}
							rootCommentId={rootCommentId}
							currentUser={currentUser}
						/>
					))}
				</div>
			))}

			{repliesQuery.isFetchingNextPage ? (
				<div className="flex items-center gap-2 text-muted-foreground text-xs">
					<div className="h-3 w-3 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
					Loading replies...
				</div>
			) : repliesQuery.hasNextPage ? (
				<Button
					variant="link"
					size="sm"
					className="p-0 h-auto text-xs"
					onClick={() => repliesQuery.fetchNextPage()}
				>
					Load more replies
				</Button>
			) : null}
		</div>
	);
}

export default RepliesList;
