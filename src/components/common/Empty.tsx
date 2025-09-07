export function Empty({ children }: { children?: React.ReactNode }) {
  return <div className="p-6 text-center text-sm text-muted-foreground">{children ?? 'データがありません'}</div>
}

