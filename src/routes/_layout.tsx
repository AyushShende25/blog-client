import { Outlet, createFileRoute } from "@tanstack/react-router";

import Header from "@/components/Header";

export const Route = createFileRoute("/_layout")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="overflow-x-hidden max-container">
			<Header />
			<main>
				<Outlet />
			</main>
		</div>
	);
}
