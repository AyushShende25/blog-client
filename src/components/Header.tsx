import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

function Header() {
	const [searchBarOpen, setsearchBarOpen] = useState(false);
	return (
		<header className="bg-secondary px-10 py-5 ">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-6 lg:gap-16">
					<Link to="/">
						<Logo />
					</Link>

					<div className="hidden md:block relative">
						<div className="absolute top-0 left-0 h-full flex items-center">
							<div className="p-1 rounded-l-md hover:bg-primary hover:text-white hover:cursor-pointer transition-colors h-full flex items-center">
								<Search size="20px" className="ml-1" />
							</div>
						</div>
						<Input placeholder="Search" className="w-96 pl-10 rounded-md" />
					</div>
				</div>
				<div className="flex items-center gap-4">
					<Link className="md:hidden" to="/search">
						<Button size="icon" variant="outline">
							<Search />
						</Button>
					</Link>
					<Link to="/login">
						<Button>Login</Button>
					</Link>
					<Link to="/signup">
						<Button className="hidden md:inline-flex">Register</Button>
					</Link>
				</div>
			</div>
		</header>
	);
}
export default Header;
