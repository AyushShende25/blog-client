import { USER_STATUS, type UserStatus } from "@/constants/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

type Author = {
	username: string;
	avatar: string | null;
	bio: string | null;
	status: UserStatus;
};

function AuthorInfo({ author }: { author: Author }) {
	const isDeleted = author.status === USER_STATUS.DELETED;

	const username = isDeleted ? "Deleted User" : author.username;

	const avatar = isDeleted
		? "/deleted-avatar.png"
		: (author.avatar ?? "/default-avatar.png");

	return (
		<div className="flex items-center gap-2">
			<Avatar size="lg">
				<AvatarImage src={avatar} />
				<AvatarFallback>{username}</AvatarFallback>
			</Avatar>
			<span>{username}</span>
		</div>
	);
}

export default AuthorInfo