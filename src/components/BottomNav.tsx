"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Target, Users, BarChart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', icon: Home, label: 'ホーム' },
  { href: '/learn-top', icon: BookOpen, label: '学習' },
  { href: '/challenge', icon: Target, label: 'チャレンジ' },
  { href: '/collab', icon: Users, label: 'コラボ' },
  { href: '/analytics', icon: BarChart, label: '分析' },
  { href: '/profile', icon: User, label: 'プロフィール' },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn('nav-item', pathname === item.href && 'active')}
        >
          <item.icon className="nav-icon" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

