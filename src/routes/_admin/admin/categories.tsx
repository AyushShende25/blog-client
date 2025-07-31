import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_admin/admin/categories")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_admin/admin/categories"!</div>;
}
