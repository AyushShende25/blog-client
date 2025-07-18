import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROLES, type User } from "@/constants/types";
import { userQueryOptions } from "@/api/userApi";
import useAvatarUpdate from "@/hooks/useAvatarUpdate";

export const Route = createFileRoute("/_dashboard/dashboard/profile")({
	component: Profile,
});

function Profile() {
	const { data: user } = useQuery(userQueryOptions());

	const updateAvatar = useAvatarUpdate();
	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("unsupported format");
			return;
		}
		if (file.size > 5 * 1024 * 1024) {
			// 5MB limit
			toast.error("File size must be less than 5MB");
			return;
		}
		updateAvatar.mutate(file);
	};

	return (
		<section className="pt-16 flex items-center justify-center">
			<div className="w-full max-w-md">
				<div className="relative">
					{/* Avatar positioned absolutely */}
					<div className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-10 group cursor-pointer">
						<label
							htmlFor="avatar"
							className="group relative h-28 w-28 cursor-pointer block"
						>
							<input
								type="file"
								id="avatar"
								name="avatar"
								accept="image/*"
								className="hidden"
								disabled={updateAvatar.isPending}
								onChange={handleAvatarUpload}
							/>
							<Avatar className="h-full w-full border-4 border-white shadow-lg">
								<AvatarImage
									src={user?.avatarUrl ?? "/default-avatar.png"}
									alt={user?.username}
								/>
								<AvatarFallback>{user?.username}</AvatarFallback>
							</Avatar>
							{/* Overlay on hover */}
							<div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<span className="text-white text-sm font-medium">
									Change Avatar
								</span>
							</div>
						</label>
					</div>

					{/* Card with proper spacing for avatar */}
					<Card className="pt-14">
						<CardHeader className="text-center">
							<CardTitle className="text-2xl">{user?.username}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-muted-foreground min-w-[60px]">
										Email:
									</span>
									<span className="text-sm">{user?.email}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-muted-foreground min-w-[60px]">
										Joined:
									</span>
									<span className="text-sm">
										{user && new Date(user.createdAt).toDateString()}
									</span>
								</div>
								{user?.role === ROLES.ADMIN ? (
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-muted-foreground min-w-[60px]">
											Role:
										</span>
										<span className="text-sm">{user.role}</span>
									</div>
								) : null}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
