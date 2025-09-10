import './globals.css'
import { cn } from '@/lib/utils'
import ClientShell from '@/components/ClientShell'
// import { Noto_Sans_JP } from 'next/font/google'

// const noto = Noto_Sans_JP({
//   weight: ['400', '700'],
//   subsets: ['latin'],
//   display: 'swap',
//   variable: '--font-noto-sans-jp'
// })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`dark`}>
      <head>
        <title>PulseStudy - 学びの、その先へ</title>
        <meta
          name="description"
          content="スナック学習とAIコーチで、『続かない』を『楽しい』に変えよう"
        />
      </head>
      <body className={cn('antialiased')}>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
