"use client"

import { useFocusMeter } from '@/hooks/useFocusMeter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { VariantProps } from 'class-variance-authority';

export function FocusMeterCard() {
  const { output, start, stop } = useFocusMeter();

  const isRunning = output.state !== 'paused';

  const getStatusVariant = (state: string): VariantProps<typeof badgeVariants>['variant'] => {
    switch(state) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'no-signal': return 'destructive';
      case 'warming_up': return 'outline';
      default: return 'secondary';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>集中度測定</CardTitle>
        <CardDescription>
          カメラを使用して集中度を測定します。映像はデバイス上でのみ処理され、サーバーには保存されません。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>ステータス:</span>
            <Badge variant={getStatusVariant(output.state)}>{output.state}</Badge>
          </div>
          <div className="flex gap-2">
            <Button onClick={start} disabled={isRunning}>開始</Button>
            <Button onClick={stop} disabled={!isRunning} variant="outline">停止</Button>
          </div>
        </div>
        {isRunning && output.state !== 'warming_up' && (
            <div className="mt-4">
                <p className="text-sm text-muted-foreground">現在の集中度: {Math.round(output.value * 100)}%</p>
            </div>
        )}
      </CardContent>
    </Card>
  )
}
