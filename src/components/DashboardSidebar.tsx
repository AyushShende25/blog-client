import { Link, useLocation } from "@tanstack/react-router";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { Icon } from "@phosphor-icons/react";

type NavigationItem = {
	readonly title: string;
	readonly to: string;
	readonly icon: Icon;
};

type DashboardSidebarProps = {
	navigationItems: readonly NavigationItem[];
};

function DashboardSidebar({ navigationItems }: DashboardSidebarProps) {
	const pathname = useLocation({
		select: (location) => location.pathname,
	});

	return (
		<Sidebar collapsible="icon" className="left-auto relative">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							{navigationItems.map((item) => (
								<SidebarMenuItem key={item.title}>
									<SidebarMenuButton asChild isActive={pathname === item.to}>
										<Link to={item.to}>
											<item.icon />
											<span>{item.title}</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
export default DashboardSidebar;
