import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text'
}

export function Skeleton({ variant = 'rect', className, ...props }: SkeletonProps) {
  const shape =
    variant === 'circle'
      ? 'rounded-full'
      : variant === 'text'
      ? 'h-4 rounded'
      : 'rounded-md'
  return (
    <div
      className={cn('animate-pulse bg-muted', shape, className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export default Skeleton
