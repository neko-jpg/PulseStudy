'use client';

import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';
import { FocusMeterProvider } from './providers/FocusMeterProvider';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/';

  return (
    <FocusMeterProvider>
      <div className="flex min-h-dvh">
        {showSidebar && <AppSidebar />}
        <main
          id="content"
          className="flex-1 transition-all duration-300 focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
        <Toaster />
      </div>
    </FocusMeterProvider>
  );
}


