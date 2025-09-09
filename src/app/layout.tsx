import './globals.css'
import { cn } from '@/lib/utils'
import ClientShell from '@/components/ClientShell'
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '700'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <title>PulseStudy - 学びの、その先へ</title>
        <meta
          name="description"
          content="スナック学習とAIコーチで、『続かない』を『楽しい』に変えよう"
        />
      </head>
      <body className={cn(inter.className, 'antialiased')}>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  )
}
