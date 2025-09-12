import Link from 'next/link'
import Image from 'next/image'
import { summaryData } from '@/lib/summary-data'
import { toApiId } from '@/lib/modules'
import { Button } from '@/components/ui/button'
import { HelpCircle, Mic, BookOpen, ChevronLeft } from 'lucide-react'

type PageProps = {
  params: Promise<{ subjectId: string }>
}

export default async function SummaryPage({ params }: PageProps) {
  const { subjectId } = await params
  let data = summaryData[subjectId]
  // Fallback: even for unknown module ids, synthesize a summary from BANK/API
  if (!data) {
    try {
      const apiId = toApiId(subjectId)
      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/modules/${apiId}`, { cache: 'no-store' })
      if (res.ok) {
        const doc = await res.json()
        const points: string[] = Array.isArray(doc?.explain) && doc.explain.length
          ? doc.explain
          : Array.isArray(doc?.items) ? doc.items.slice(0, 5).map((it: any) => String(it?.exp || it?.q || '')) : []
        data = {
          title: String(doc?.title || '学習の要点'),
          subject: String(doc?.subject || ''),
          progress: '0/1',
          points: points.filter(Boolean),
          imageUrl: 'https://images.unsplash.com/photo-1529078155058-5d716f45d604?q=80&w=1200&auto=format&fit=crop',
          imageAlt: 'Study illustration',
        }
      }
    } catch {}
    // Final guard
    if (!data) {
      data = {
        title: '学習の要点',
        subject: '',
        progress: '0/1',
        points: ['この単元の要点は準備中です。続行して問題に挑戦できます。'],
        imageUrl: 'https://images.unsplash.com/photo-1529078155058-5d716f45d604?q=80&w=1200&auto=format&fit=crop',
        imageAlt: 'Study illustration',
      }
    }
  }

  const { title, subject, progress, points, imageUrl, imageAlt } = data
  const progressPercentage = (parseInt(progress.split('/')[0]) / parseInt(progress.split('/')[1])) * 100

  return (
    <div className="flex-1 p-8 bg-background text-foreground">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-muted-foreground">{subject} {progress}</span>
            <div className="w-64 h-2 rounded-full bg-secondary">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-muted p-2 rounded-lg cursor-pointer border">
            <BookOpen className="text-yellow-400" />
          </div>
          <div className="bg-muted p-2 rounded-lg cursor-pointer border">
            <Mic className="text-blue-400" />
          </div>
          <div className="bg-muted p-2 rounded-lg cursor-pointer border">
            <HelpCircle className="text-red-400" />
          </div>
        </div>
      </header>

      <div className="bg-card p-8 rounded-xl border">
        <h3 className="text-xl font-bold text-card-foreground mb-6">要点</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <ul className="space-y-3 text-muted-foreground list-disc list-inside">
              {points.map((point, index) => (
                <li key={index}>{point}</li>
              ))}
            </ul>
          </div>
          <div>
            <Image
              alt={imageAlt}
              className="rounded-lg w-full h-auto"
              src={imageUrl}
              width={500}
              height={300}
              priority
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <Link href="/learn-top" passHref>
          <Button variant="ghost">
            <ChevronLeft className="mr-2 h-4 w-4" />
            学習選択へ
          </Button>
        </Link>
        <Link href={`/learn?module=${subjectId}`} passHref>
          <Button className="px-12 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors text-lg">
            問題へ
          </Button>
        </Link>
      </div>
    </div>
  )
}
