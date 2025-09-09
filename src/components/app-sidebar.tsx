"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Home,
  BookOpen,
  Target,
  Users,
  BarChart,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogoIcon } from './icons/app-logo-icon';
import { useSidebar } from '@/hooks/use-sidebar';
import { useAuthStore } from '@/store/authStore';

export function AppSidebar() {
  const { isCollapsed, toggleSidebar, isMobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);

  const navItems = useMemo(() => {
    const base = [
      { href: '/home', icon: Home, label: 'ホーム' },
      { href: '/learn-top', icon: BookOpen, label: '学習' },
      { href: '/challenge', icon: Target, label: 'チャレンジ' },
      { href: '/collab', icon: Users, label: 'コラボ' },
      { href: '/analytics', icon: BarChart, label: '分析' },
      { href: '/profile', icon: User, label: 'プロフィール' },
    ];
    if (role === 'teacher') {
      base.splice(1, 0, { href: '/teacher-dashboard', icon: GraduationCap, label: '教師ダッシュボード' });
    }
    return base;
  }, [role]);

  const NavContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between p-4">
        <div className={cn('flex items-center gap-2 overflow-hidden', isCollapsed && 'hidden')}>
          <AppLogoIcon className="size-8" />
          <span className="text-lg font-semibold">PulseStudy</span>
        </div>
        <Button variant="ghost" size="icon" className="hidden md:flex" onClick={toggleSidebar}>
          {isCollapsed ? (
            <PanelLeftOpen className="size-5" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>
      </div>
      <nav className="flex-1 space-y-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            passHref
            onClick={() => setMobileOpen(false)}
            title={isCollapsed ? item.label : undefined}
            aria-current={pathname === item.href ? 'page' : undefined}
          >
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start relative',
                isCollapsed && 'justify-center',
                pathname === item.href &&
                  'before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary'
              )}
            >
              <item.icon className={cn('h-5 w-5', !isCollapsed && 'mr-2')} />
              <span className={cn(isCollapsed && 'hidden')}>{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="pointer-events-none fixed top-4 left-4 z-50 md:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="pointer-events-auto">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className={cn('hidden md:block transition-all duration-300', isCollapsed ? 'w-20' : 'w-64')}>
        <div className={cn('fixed h-full transition-all duration-300', isCollapsed ? 'w-20' : 'w-64')}>
          <NavContent />
        </div>
      </div>
    </>
  );
}
