'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/';

  return (
    <div className="flex min-h-dvh">
      {showSidebar && <AppSidebar />}
      <main className="flex-1 transition-all duration-300">{children}</main>
      <Toaster />
    </div>
  );
}


