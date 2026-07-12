import { cn } from '@/lib/utils'

interface AssetFlowLogoProps {
  size?: 'sm' | 'md' | 'lg'
  showGlow?: boolean
  className?: string
}

const sizes = {
  sm: 'h-10 w-10',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
}

export function AssetFlowLogo({ size = 'md', showGlow = false, className }: AssetFlowLogoProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-blue-500/30 blur-2xl scale-150" />
      )}
      <div className={cn('relative rounded-full overflow-hidden ring-2 ring-white/10', sizes[size])}>
        <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <circle cx="40" cy="40" r="40" fill="#0F172A" />
          <path
            d="M40 18L58 52H22L40 18Z"
            fill="url(#logoGradient)"
          />
          <path
            d="M28 48H52L46 58H34L28 48Z"
            fill="#F59E0B"
          />
          <defs>
            <linearGradient id="logoGradient" x1="22" y1="18" x2="58" y2="52" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

export function AssetFlowBrand({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <AssetFlowLogo size="sm" />
      <div>
        <p className="text-lg font-bold tracking-tight text-white">AssetFlow</p>
        <p className="text-[10px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          By SRB Tech
        </p>
      </div>
    </div>
  )
}
