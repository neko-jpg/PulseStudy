import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} aria-busy="true" aria-live="polite">
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full mt-2" />
            <Skeleton className="h-9 w-full mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

