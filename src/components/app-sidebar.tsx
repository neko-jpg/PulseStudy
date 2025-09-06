"use client";

import { useState } from 'react';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppLogoIcon } from './icons/app-logo-icon';

const navItems = [
  { href: '/home', icon: Home, label: 'ホーム' },
  { href: '/learn-top', icon: BookOpen, label: '学習' },
  { href: '/challenge', icon: Target, label: 'チャレンジ' },
  { href: '/collab', icon: Users, label: 'コラボ' },
  { href: '/analytics', icon: BarChart, label: '分析' },
  { href: '/profile', icon: User, label: 'プロフィール' },
];

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const NavContent = () => (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
       <div className="flex items-center gap-2 p-4">
         <AppLogoIcon className="size-8" />
         <span className="text-lg font-semibold">PulseStudy</span>
       </div>
      <nav className="flex-1 space-y-2 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            passHref
            onClick={() => setIsOpen(false)}
          >
            <Button
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <item.icon className="mr-2 h-5 w-5" />
              {item.label}
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
         <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
      <div className="hidden md:block md:w-64">
        <div className="fixed h-full w-64">
            <NavContent />
        </div>
      </div>
    </>
  );
}
