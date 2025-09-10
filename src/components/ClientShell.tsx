'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';
import { FocusMeterProvider } from './providers/FocusMeterProvider';
import { useSessionStore } from '@/store/sessionStore';

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/';

  // Add global listeners to ensure session data is saved if the user leaves.
  useEffect(() => {
    const handleBeforeUnload = () => {
      // This is a failsafe. The component unmount on the learn page is the primary mechanism.
      const { status, finalizeSession } = useSessionStore.getState();
      if (status === 'in_progress') {
        finalizeSession('aborted');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        const { status, finalizeSession } = useSessionStore.getState();
        if (status === 'in_progress') {
          finalizeSession('aborted');
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);


  return (
    <FocusMeterProvider>
      <div className="flex min-h-dvh">
        {showSidebar && <AppSidebar />}
        <main
          id="content"
          className="flex flex-1 transition-all duration-300 focus:outline-none"
          tabIndex={-1}
        >
          {children}
        </main>
        <Toaster />
      </div>
    </FocusMeterProvider>
  );
}


