import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title?: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        {title && <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>}
        {description && <p className={cn('text-sm text-muted-foreground', title && 'mt-1')}>{description}</p>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  )
}
