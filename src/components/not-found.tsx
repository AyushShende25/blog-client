import { Link } from "@tanstack/react-router";
import { Button } from "./ui/button";

function NotFound() {
	return (
		<div className="flex-center h-screen p-2 text-2xl">
			<div className="flex flex-col items-center gap-4">
				<p className="text-4xl font-bold">404</p>
				<p className="text-lg">Page not found</p>
				<Button asChild>
					<Link to="/">Go Home</Link>
				</Button>
			</div>
		</div>
	);
}
export default NotFound;
