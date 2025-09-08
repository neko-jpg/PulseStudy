// Server Component layout
import './globals.css';
import { cn } from '@/lib/utils';
import ClientShell from '@/components/ClientShell';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <title>PulseStudy - 学びの、その先へ</title>
        <meta name="description" content="スナック学習とAIコーチで、『続かない』を『楽しい』に変えよう" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('antialiased')}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}

