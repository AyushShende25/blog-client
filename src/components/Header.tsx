import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ModeToggle } from '@/components/mode-toggle';
import { userQueryOptions } from '@/api/userApi';
import useLogout from '@/hooks/useLogout';

function Header() {
  const [isSearchBannerOpen, setIsSearchBannerOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSearchBannerOpen(false);
      }
    };

    if (isSearchBannerOpen) {
      window.addEventListener('keydown', handleEsc);
    }

    return () => window.removeEventListener('keydown', handleEsc);
  }, [isSearchBannerOpen]);

  const { data: user } = useQuery(userQueryOptions());

  const navigate = useNavigate();

  const { logoutMutation } = useLogout();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const searchQuery = e.currentTarget.value;
    if (e.key === 'Enter') {
      navigate({
        to: '/search',
        search: (prev) => ({
          ...prev,
          filter: searchQuery,
        }),
      });
      setIsSearchBannerOpen(false);
    }
  };

  return (
    <header className="pd-x py-6 relative">
      {/* Search Banner */}
      {isSearchBannerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-foreground/35 z-10 animate-in fade-in duration-200"
            onClick={() => setIsSearchBannerOpen(false)}
          />

          <div className="w-full pd-x py-8 bg-background fixed top-0 left-0 z-20 flex items-center animate-in slide-in-from-top duration-300">
            <Input
              placeholder="Search"
              className="outline-none border-none focus-visible:ring-0 placeholder:font-bold md:text-3xl text-2xl w-full pr-12"
              autoFocus
              onKeyDown={handleKeyPress}
            />
            <Button
              onClick={() => setIsSearchBannerOpen(false)}
              size={'icon'}
              className="absolute right-10"
            >
              <X size={24} />
            </Button>
          </div>
        </>
      )}

      {/* NavBar */}
      <div className="flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-4">
          <div className="hidden md:block relative ">
            <Search
              size="20px"
              className="absolute top-2 left-2 cursor-pointer"
              onClick={() => setIsSearchBannerOpen(true)}
            />
            <Input
              placeholder="Search"
              onFocus={() => setIsSearchBannerOpen(true)}
              className="pl-10 rounded-3xl"
            />
          </div>
          <Button
            size="icon"
            className="md:hidden"
            variant="outline"
            onClick={() => setIsSearchBannerOpen(true)}
          >
            <Search />
          </Button>
          <ModeToggle />
          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <Link to="/new-post">
                    <DropdownMenuItem>New Post</DropdownMenuItem>
                  </Link>
                  <Link to="/dashboard">
                    <DropdownMenuItem>Dashboard</DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation()}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
export default Header;
