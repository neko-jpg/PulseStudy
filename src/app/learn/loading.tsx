export default function Loading() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-16 w-2/3 bg-muted animate-pulse rounded" />
      <div className="h-40 w-full bg-muted animate-pulse rounded" />
      <div className="h-10 w-full bg-muted animate-pulse rounded" />
    </div>
  );
}

