import { userQueryOptions } from "@/api/authApi";
import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminNavItems } from "@/constants";
import { ShieldCheckIcon } from "@phosphor-icons/react";
import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const data = await context.queryClient.ensureQueryData(userQueryOptions());
		if (!data?.user || data.user.role !== "ADMIN") {
			throw redirect({ to: "/login" });
		}
	},
});

function RouteComponent() {
	return (
		<div className="container min-h-screen">
			<SidebarProvider className="block overflow-x-hidden w-full">
				<div className="flex flex-col h-screen">
					<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 shrink-0">
						<div className="flex h-16 items-center justify-between px-2 md:px-6">
							<SidebarTrigger />
							<div className="flex items-center gap-2">
								<ShieldCheckIcon size={32} />
								<h1 className="text-xl font-semibold">Dashboard</h1>
							</div>

							<div>
								<Link
									to="/"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									← Back to Blog
								</Link>
							</div>
						</div>
					</header>

					<div className="flex flex-1 overflow-hidden">
						<DashboardSidebar navigationItems={AdminNavItems} />
						<main className="flex-1 p-6 overflow-y-auto">
							<Outlet />
						</main>
					</div>
				</div>
			</SidebarProvider>
		</div>
	);
}
