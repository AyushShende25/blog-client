import { useUpdateAvatar } from "@/api/userApi";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/constants/types";
import { AVATAR_MAX_SIZE } from "@/constants";

function AvatarUpload({ user }: { user: User }) {
	const updateAvatarMutation = useUpdateAvatar();

	const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("unsupported format");
			return;
		}
		if (file.size > AVATAR_MAX_SIZE) {
			toast.error("File size must be less than 5MB");
			return;
		}
		updateAvatarMutation.mutate(file);
	};
	return (
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
						src={user.avatar ?? "/default-avatar.png"}
						alt={user.username}
					/>
					<AvatarFallback>{user.username}</AvatarFallback>
				</Avatar>
				{/* Overlay on hover */}
				<div className="absolute inset-0 bg-primary/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
					<span className="text-primary-foreground text-sm font-medium">
						Change Avatar
					</span>
				</div>
			</label>
		</div>
	);
}
export default AvatarUpload;
