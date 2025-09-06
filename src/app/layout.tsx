
'use client';

import { usePathname } from 'next/navigation';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AppSidebar } from '@/components/app-sidebar';
import { useEffect, useState } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showSidebar = isClient && !['/', '/teacher-dashboard'].includes(pathname);

  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <title>PulseStudy - 学びの、その先へ。</title>
        <meta name="description" content="5分のスナック学習とAIコーチで、「続かない」を「楽しい」に変えよう。" />
      </head>
      <body className={cn('font-body antialiased')}>
        {isClient ? (
            showSidebar ? (
            <div className="flex">
                <AppSidebar />
                <main className="flex-1 transition-all duration-300">{children}</main>
            </div>
            ) : (
            <main>{children}</main>
            )
        ) : (
          <main>{children}</main>
        )}
        {isClient && <Toaster />}
      </body>
    </html>
  );
}
