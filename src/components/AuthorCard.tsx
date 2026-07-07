import type { Post, User } from "@/constants/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
	fetchIsFollowingQueryOptions,
	fetchUserStatsQueryOptions,
	useFollow,
	useUnfollow,
} from "@/api/userApi";

type AuthorCardProps = {
	post: Post;
	user?: User;
};

function AuthorCard({ post, user }: AuthorCardProps) {
	const authorStatsQuery = useQuery(
		fetchUserStatsQueryOptions({ userId: post.authorId }),
	);
	const isFollowingQuery = useQuery(
		fetchIsFollowingQueryOptions({ userId: post.authorId }),
	);
	const followUserMutation = useFollow();
	const unfollowUserMutation = useUnfollow();

	const isOwnPost = post.authorId === user?.id;
	const handleToggleFollow = () => {
		if (isFollowingQuery.data?.isFollowing) {
			unfollowUserMutation.mutate(post.authorId);
		} else {
			followUserMutation.mutate(post.authorId);
		}
	};
	return (
		<div className="flex gap-4">
			<Avatar size="lg">
				<AvatarImage src={post.author?.avatar ?? "/default-avatar.png"} />
				<AvatarFallback>{post.author?.username}</AvatarFallback>
			</Avatar>
			<div className="flex-1">
				<div className="flex justify-between">
					<h4 className="font-semibold text-lg md:text-xl">
						Written by {post.author?.username}
					</h4>
					{!isOwnPost && (
						<Button
							variant="outline"
							className="cursor-pointer"
							size="lg"
							onClick={handleToggleFollow}
						>
							{isFollowingQuery.data?.isFollowing ? "Unfollow" : "Follow"}
						</Button>
					)}
				</div>
				<p className="font-light text-muted-foreground space-x-4 text-sm">
					<span>{authorStatsQuery.data?.followers} followers</span>
					<span>{authorStatsQuery.data?.following} following</span>
				</p>
				<p className="mt-4">{post.author?.bio}</p>
			</div>
		</div>
	);
}

export default AuthorCard;
