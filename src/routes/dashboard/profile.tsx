import { createFileRoute, Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userQueryOptions } from "@/api/authApi";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ROLES } from "@/constants/types";
import { socialLinksMap } from "@/constants";
import { Button } from "@/components/ui/button";
import { useUpdateAvatar } from "@/api/userApi";

export const Route = createFileRoute("/dashboard/profile")({
	component: RouteComponent,
});

function RouteComponent() {
	const userQuery = useQuery(userQueryOptions());

	const updateAvatarMutation = useUpdateAvatar();
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
		updateAvatarMutation.mutate(file);
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
								disabled={updateAvatarMutation.isPending}
								onChange={handleAvatarUpload}
							/>
							<Avatar className="h-full w-full border-4 border-white shadow-lg">
								<AvatarImage
									src={userQuery.data?.user.avatar ?? "/default-avatar.png"}
									alt={userQuery.data?.user.username}
								/>
								<AvatarFallback>{userQuery.data?.user.username}</AvatarFallback>
							</Avatar>
							{/* Overlay on hover */}
							<div className="absolute inset-0 bg-primary/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
								<span className="text-primary-foreground text-sm font-medium">
									Change Avatar
								</span>
							</div>
						</label>
					</div>

					{/* Card with proper spacing for avatar */}
					<Card className="pt-14">
						<CardHeader className="text-center space-y-4">
							<CardTitle className="text-2xl">
								{userQuery.data?.user.username}
							</CardTitle>
							<div className="flex items-center justify-center gap-3">
								<div className="space-x-1">
									<span>{userQuery.data?.user._count.followers}</span>
									<span>Followers</span>
								</div>
								<div className="space-x-1">
									<span>{userQuery.data?.user._count.following}</span>
									<span>Following</span>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-6">
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-muted-foreground min-w-15">
										Email:
									</span>
									<span className="text-sm">{userQuery.data?.user.email}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-muted-foreground min-w-15">
										Bio:
									</span>
									<span className="text-sm">{userQuery.data?.user.bio}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-muted-foreground min-w-15">
										Socials:
									</span>
									<div className="flex gap-2">
										{userQuery.data?.user.socialLinks?.map((item) => {
											const Icon = socialLinksMap[item.platform];

											if (!Icon) return null;

											return (
												<Button
													size={"icon-lg"}
													variant={"ghost"}
													asChild
													key={item.platform}
												>
													<Link to={item.link} target="_blank">
														<Icon className="size-6" />
													</Link>
												</Button>
											);
										})}
									</div>
								</div>
								<div className="flex items-center gap-2">
									<span className="text-sm font-medium text-muted-foreground min-w-15">
										Joined:
									</span>
									<span className="text-sm">
										{userQuery.data?.user &&
											new Date(userQuery.data?.user.createdAt).toDateString()}
									</span>
								</div>
								{userQuery.data?.user?.role === ROLES.ADMIN ? (
									<div className="flex items-center gap-2">
										<span className="text-sm font-medium text-muted-foreground min-w-15">
											Role:
										</span>
										<span className="text-sm">{userQuery.data?.user.role}</span>
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
