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
import AuthorInfo from "./AuthorInfo";

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
		<div className="space-y-2">
			<div className="flex justify-between items-start">
				<div className="space-y-4">
					<h4 className="text-lg font-semibold md:text-xl">Written by</h4>
					{post.author && <AuthorInfo author={post.author} />}
				</div>
				{!isOwnPost && (
					<Button variant="outline" size="lg" onClick={handleToggleFollow}>
						{isFollowingQuery.data?.isFollowing ? "Unfollow" : "Follow"}
					</Button>
				)}
			</div>

			<div className="flex gap-4 text-sm font-light text-muted-foreground">
				<span>{authorStatsQuery.data?.followers} followers</span>
				<span>{authorStatsQuery.data?.following} following</span>
			</div>

			<p className="mt-4">{post.author?.bio}</p>
		</div>
	);
}

export default AuthorCard;
