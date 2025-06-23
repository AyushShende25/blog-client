import { Link, useLocation } from '@tanstack/react-router';
import { BookOpen, Edit3, FileText, User } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const navigationItems = [
  {
    title: 'Published',
    url: '/dashboard/published',
    icon: FileText,
  },
  {
    title: 'Drafts',
    url: '/dashboard/draft',
    icon: Edit3,
  },
  {
    title: 'Profile',
    url: '/dashboard/profile',
    icon: User,
  },
  {
    title: 'Library',
    url: '/dashboard/library',
    icon: BookOpen,
  },
];

function DashboardSidebar() {
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
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link to={item.url}>
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
