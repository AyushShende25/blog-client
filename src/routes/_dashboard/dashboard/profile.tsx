import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ROLES, type User } from '@/constants/types';
import { userQueryOptions } from '@/api/userApi';

export const Route = createFileRoute('/_dashboard/dashboard/profile')({
  component: Profile,
});

function Profile() {
  const { data } = useQuery(userQueryOptions());
  const user: User = data;

  return (
    <section className="pt-16 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="relative">
          {/* Avatar positioned absolutely */}
          <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 z-10">
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarImage src="https://github.com/shadcn.png" alt="John Doe" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>

          {/* Card with proper spacing for avatar */}
          <Card className="pt-14">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{user.username}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground min-w-[60px]">
                    Email:
                  </span>
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground min-w-[60px]">
                    Joined:
                  </span>
                  <span className="text-sm">
                    {new Date(user.createdAt).toDateString()}
                  </span>
                </div>
                {user.role === ROLES.ADMIN ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[60px]">
                      Role:
                    </span>
                    <span className="text-sm">{user.role}</span>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
