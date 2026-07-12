import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/shared/page-header'

interface PageShellProps {
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  contentClassName?: string
}

export function PageShell({
  description,
  actions,
  children,
  className,
  contentClassName,
}: PageShellProps) {
  const hasHeader = Boolean(description || actions)

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {hasHeader && (
        <PageHeader description={description}>
          {actions}
        </PageHeader>
      )}
      <div className={cn('flex flex-col gap-6', contentClassName)}>
        {children}
      </div>
    </div>
  )
}
