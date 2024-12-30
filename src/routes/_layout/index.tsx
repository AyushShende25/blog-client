import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
	component: HomeComponent,
});

function HomeComponent() {
	return <section className="p-2">home</section>;
}
