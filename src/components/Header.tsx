import { Link } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import Logo from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function Header() {
	const [isSearchBannerOpen, setIsSearchBannerOpen] = useState(false);

	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsSearchBannerOpen(false);
			}
		};

		if (isSearchBannerOpen) {
			window.addEventListener("keydown", handleEsc);
		}

		return () => window.removeEventListener("keydown", handleEsc);
	}, [isSearchBannerOpen]);

	return (
		<header className="pd-x py-6 relative">
			{/* Search Banner */}
			{isSearchBannerOpen && (
				<>
					{/* Overlay */}
					<div
						className="fixed inset-0 bg-foreground/35 z-10 animate-in fade-in duration-200"
						onClick={() => setIsSearchBannerOpen(false)}
					/>

					<div className="w-full pd-x py-8 bg-background fixed top-0 left-0 z-20 flex items-center animate-in slide-in-from-top duration-300">
						<Input
							placeholder="Search"
							className="outline-none border-none focus-visible:ring-0 placeholder:font-bold md:text-3xl text-3xl w-full pr-12"
							autoFocus
						/>
						<Button
							onClick={() => setIsSearchBannerOpen(false)}
							size={"icon"}
							className="absolute right-10 z-20"
						>
							<X size={24} />
						</Button>
					</div>
				</>
			)}

			{/* NavBar */}
			<div className="flex items-center justify-between">
				<Link to="/">
					<Logo />
				</Link>
				<nav className="flex items-center gap-4">
					<div className="hidden md:block relative ">
						<Search
							size="20px"
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
						size="icon"
						className="md:hidden"
						variant="outline"
						onClick={() => setIsSearchBannerOpen(true)}
					>
						<Search />
					</Button>

					<Link to="/login">
						<Button>Login</Button>
					</Link>
				</nav>
			</div>
		</header>
	);
}
export default Header;
