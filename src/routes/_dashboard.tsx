import {
  createFileRoute,
  Outlet,
  redirect,
  Link,
  useRouterState,
} from '@tanstack/react-router';
import { BookOpen, Edit3, FileText, PenTool, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { userQueryOptions } from '@/api/userApi';

export const Route = createFileRoute('/_dashboard')({
  component: DashboardLayout,
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData(userQueryOptions());
    if (!user) {
      throw redirect({ to: '/login' });
    }
  },
});

const sidebarItems = [
  {
    name: 'Published',
    href: '/dashboard/published',
    icon: FileText,
    description: 'Your published posts',
  },
  {
    name: 'Drafts',
    href: '/dashboard/draft',
    icon: Edit3,
    description: 'Work in progress',
  },
  {
    name: 'Profile',
    href: '/dashboard/profile',
    icon: User,
    description: 'Account settings',
  },
  {
    name: 'Library',
    href: '/dashboard/library',
    icon: BookOpen,
    description: 'Saved articles',
  },
];

function DashboardLayout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <PenTool className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>

          {/* You can add user menu, notifications etc here */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card/30 min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="p-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      isActive && 'text-primary-foreground'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    <span
                      className={cn(
                        'text-xs transition-colors',
                        isActive
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground/60'
                      )}
                    >
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
