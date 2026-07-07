import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import Logo from "@/components/Logo";
import { ModeToggle } from "@/components/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useLogout, userQueryOptions } from "@/api/authApi";
import { MagnifyingGlassIcon, XCircleIcon } from "@phosphor-icons/react";
import type { User } from "@/constants/types";
import { defaultBlogSearch } from "@/constants";

function Header() {
	const [isSearchBannerOpen, setIsSearchBannerOpen] = useState(false);

	const { data, isPending } = useQuery(userQueryOptions());

	return (
		<header className="container px-4 sm:px-10 lg:px-14 py-6 relative">
			{isSearchBannerOpen && (
				<SearchBanner
					isSearchBannerOpen={isSearchBannerOpen}
					onSearchBannerChange={setIsSearchBannerOpen}
				/>
			)}

			<div className="flex items-center justify-between">
				<Link to="/">
					<Logo />
				</Link>
				<nav className="flex items-center gap-2 md:gap-6">
					<div className="hidden md:block relative">
						<MagnifyingGlassIcon
							size={20}
							className="absolute top-2 left-2 cursor-pointer"
							onClick={() => setIsSearchBannerOpen(true)}
						/>
						<Input
							placeholder="Search"
							onFocus={() => setIsSearchBannerOpen(true)}
							className="pl-10 rounded-3xl"
						/>
					</div>
					<Button
						size="icon-sm"
						className="md:hidden"
						variant="outline"
						onClick={() => setIsSearchBannerOpen(true)}
					>
						<MagnifyingGlassIcon size={20} />
					</Button>
					<ModeToggle />
					{isPending ? null : data ? (
						<Menu user={data.user} />
					) : (
						<Button asChild>
							<Link to="/login">Login</Link>
						</Button>
					)}
				</nav>
			</div>
		</header>
	);
}
export default Header;

function Menu({ user }: { user: User }) {
	const logoutMutation = useLogout();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="rounded-full">
				<Avatar>
					<AvatarImage src={user?.avatar ?? "/default-avatar.png"} />
					<AvatarFallback>{user?.username}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<Link to="/posts/new">
					<DropdownMenuItem>New Post</DropdownMenuItem>
				</Link>
				<Link to="/dashboard">
					<DropdownMenuItem>Dashboard</DropdownMenuItem>
				</Link>
				{user.role === "ADMIN" ? (
					<Link to="/admin">
						<DropdownMenuItem>Admin Dashboard</DropdownMenuItem>
					</Link>
				) : null}
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => logoutMutation.mutate()}>
					Logout
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SearchBanner({
	isSearchBannerOpen,
	onSearchBannerChange,
}: {
	isSearchBannerOpen: boolean;
	onSearchBannerChange: Dispatch<SetStateAction<boolean>>;
}) {
	const navigate = useNavigate();

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onSearchBannerChange(false);
			}
		};

		if (isSearchBannerOpen) {
			window.addEventListener("keydown", handleEsc);
		}

		return () => window.removeEventListener("keydown", handleEsc);
	}, [isSearchBannerOpen]);

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const searchQuery = e.currentTarget.value;
		if (e.key === "Enter") {
			navigate({
				to: "/posts/search",
				search: {
					...defaultBlogSearch,
					search: searchQuery,
				},
			});
			onSearchBannerChange(false);
		}
	};
	return (
		<>
			<div
				className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
				onClick={() => onSearchBannerChange(false)}
			/>
			<div
				className="fixed top-0 left-0 right-0 z-50
                   bg-background/95 backdrop-blur-md
                   shadow-lg border-b
                   animate-in slide-in-from-top duration-300 container"
			>
				<div className="px-2 sm:px-10 py-8 relative flex items-center">
					<Input
						placeholder="Search for posts..."
						className="w-full 
                       border-none 
                       focus-visible:ring-0 shadow-none
                       bg-transparent
                       text-2xl md:text-3xl
                       font-semibold
                       placeholder:text-muted-foreground/70 placeholder:text-sm md:placeholder:text-lg dark:bg-transparent"
						autoFocus
						onKeyDown={handleKeyPress}
					/>

					<Button
						onClick={() => onSearchBannerChange(false)}
						variant="link"
						className="absolute right-1 cursor-pointer"
					>
						<XCircleIcon className="w-full h-full size-4" />
					</Button>
				</div>
			</div>
		</>
	);
}
