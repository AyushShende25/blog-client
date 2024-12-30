import { Outlet, createFileRoute } from "@tanstack/react-router";

import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="overflow-hidden">
			<Header />
			<main>
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
