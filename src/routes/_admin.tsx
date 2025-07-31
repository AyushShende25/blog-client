import {
	Link,
	Outlet,
	createFileRoute,
	redirect,
} from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { userQueryOptions } from "@/api/userApi";
import DashboardSidebar from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminNavItems } from "@/constants";

export const Route = createFileRoute("/_admin")({
	component: RouteComponent,
	beforeLoad: async ({ context }) => {
		const user = await context.queryClient.ensureQueryData(userQueryOptions());
		if (!user) {
			throw redirect({ to: "/login" });
		}
		if (user.role !== "ADMIN") {
			toast.error("Not Enough Permissions");
			throw redirect({ to: "/" });
		}
	},
});

function RouteComponent() {
	return (
		<div className="max-container min-h-screen">
			<SidebarProvider className="block overflow-x-hidden w-full">
				<div className="flex flex-col h-screen">
					<header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40 shrink-0">
						<div className="flex h-16 items-center justify-between px-2 md:px-6">
							<SidebarTrigger />
							<div className="flex items-center gap-2">
								<ShieldCheck />
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
