import { createFileRoute } from "@tanstack/react-router";
import { userQueryOptions } from "@/api/authApi";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import ProfileCard from "@/components/ProfileCard";
import AvatarUpload from "@/components/AvatarUpload";

export const Route = createFileRoute("/dashboard/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	const userQuery = useQuery(userQueryOptions());
	const [isEditing, setIsEditing] = useState(false);

	const user = userQuery.data?.user;

	if (!user) return null;

	return (
		<section className="pt-16 flex items-center justify-center">
			<div className="w-full max-w-md">
				<div className="relative">
					<AvatarUpload user={user} />
					<ProfileCard
						user={user}
						isEditing={isEditing}
						onEdit={() => setIsEditing(true)}
						onCancel={() => setIsEditing(false)}
						onSuccess={() => setIsEditing(false)}
					/>
				</div>
			</div>
		</section>
	);
}
