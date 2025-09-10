"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLearnStore } from "@/store/learn"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Check, Clock, Home, RefreshCw } from "lucide-react"

// Helper function to format time
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export default function ResultsPage() {
  const router = useRouter()
  const { correct, total, elapsedTime, reset } = useLearnStore()

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0

  const handleTryAgain = () => {
    reset()
    router.push('/learn-top')
  }

  return (
    <main className="flex-1 p-8 bg-background text-foreground flex items-center justify-center">
      <Card className="w-full max-w-2xl text-center">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">学習完了！</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-around items-center p-6 bg-muted rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">正解率</p>
              <p className="text-4xl font-bold text-primary">{accuracy}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">正解数</p>
              <p className="text-4xl font-bold">{correct} / {total}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">かかった時間</p>
              <p className="text-4xl font-bold">{formatTime(elapsedTime)}</p>
            </div>
          </div>
          <div className="text-2xl font-semibold">
            お疲れ様でした！
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button onClick={handleTryAgain} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            他の問題を解く
          </Button>
          <Link href="/home">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              ホームに戻る
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </main>
  )
}
