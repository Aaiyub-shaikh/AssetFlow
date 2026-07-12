import { motion } from 'framer-motion'
import { QrCode } from 'lucide-react'

interface QRDisplayProps {
  code: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function QRDisplay({ code, label, size = 'md' }: QRDisplayProps) {
  const sizes = { sm: 'h-24 w-24', md: 'h-36 w-36', lg: 'h-48 w-48' }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className={`${sizes[size]} glass-card flex items-center justify-center relative overflow-hidden`}>
        <div className="absolute inset-2 grid grid-cols-8 grid-rows-8 gap-px opacity-60">
          {Array.from({ length: 64 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${Math.random() > 0.45 ? 'bg-foreground' : 'bg-transparent'}`}
            />
          ))}
        </div>
        <QrCode className="h-8 w-8 text-primary relative z-10" />
      </div>
      {label && <p className="text-sm font-mono text-muted-foreground">{label || code}</p>}
    </motion.div>
  )
}
