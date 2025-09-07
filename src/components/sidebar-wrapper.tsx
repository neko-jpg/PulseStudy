"use client";

import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/app-sidebar';

export function SidebarWrapper() {
  const pathname = usePathname();
  const showSidebar = !['/', '/teacher-dashboard'].includes(pathname);

  if (!showSidebar) {
    return null;
  }

  return <AppSidebar />;
}