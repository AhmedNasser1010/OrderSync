export default function Page({ children, className }: { children: React.ReactNode, className?: string }) {
    return (
      <div className={`container mx-auto p-4 bg-background text-foreground ${className || ''}`}>{children}</div>
    )
  }