'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, Menu, X, LayoutGrid } from 'lucide-react';
import { logoutAction } from '@/app/actions';
import type { User as UserType } from '@/types';

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        'transition-colors hover:text-foreground/80',
        isActive ? 'text-foreground font-semibold' : 'text-foreground/60'
      )}
    >
      {children}
    </Link>
  );
}

export function TopNavbar({ user }: { user: UserType | null }) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin
    ? [
        { href: '/admin/dashboard', label: 'Dashboard' },
        { href: '/admin/doctors', label: 'Doctors' },
        { href: '/admin/patients', label: 'Patients' },
      ]
    : [
        { href: '/dashboard', label: 'Dashboard' },
      ];

  const settingsHref = isAdmin ? '/admin/settings' : '/settings';
  const logoHref = isAdmin ? "/admin/dashboard" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
            <Logo href={logoHref} />
        </div>
        
        <div className="flex-1 md:hidden">
            <Logo href={logoHref} />
        </div>

        <nav className="hidden items-center space-x-6 text-sm font-medium md:flex ml-auto mr-6">
            {navItems.map((item) => (
                <NavLink key={item.href} href={item.href}>
                    {item.label}
                </NavLink>
            ))}
        </nav>

        <div className="flex items-center justify-end space-x-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user?.avatarUrl} alt={user?.name || 'User'} data-ai-hint="person portrait" />
                        <AvatarFallback>
                            {user ? user.name.charAt(0).toUpperCase() : <User />}
                        </AvatarFallback>
                    </Avatar>
                </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name || 'My Account'}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                 <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'}>
                    <DropdownMenuItem>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                    </DropdownMenuItem>
                </Link>
                <Link href={settingsHref}>
                    <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span>Support</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <form action={logoutAction} className="w-full">
                    <input type="hidden" name="role" value={user?.role} />
                    <button type="submit" className="w-full">
                        <DropdownMenuItem>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Logout</span>
                        </DropdownMenuItem>
                    </button>
                </form>
                </DropdownMenuContent>
            </DropdownMenu>

            <button
                className="inline-flex items-center justify-center rounded-md p-2 text-foreground/70 hover:bg-accent hover:text-accent-foreground md:hidden"
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div className="md:hidden opacity-0 animate-fade-in">
          <div className="container flex flex-col gap-4 py-4">
             {navItems.map((item) => (
                <NavLink key={item.href} href={item.href}>
                    {item.label}
                </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
