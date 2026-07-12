import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'

interface QRDisplayProps {
  code: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export function QRDisplay({ code, label, size = 'md' }: QRDisplayProps) {
  const sizes = { sm: 'h-28 w-28', md: 'h-40 w-40', lg: 'h-52 w-52' }
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}`

  const handleDownload = async () => {
    try {
      const res = await fetch(qrUrl)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${label || 'qrcode'}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success('QR Code downloaded successfully!')
    } catch {
      toast.error('Failed to download QR code')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className={`${sizes[size]} rounded-2xl bg-white p-3 flex items-center justify-center relative shadow-lg border border-white/[0.08]`}>
        <img
          src={qrUrl}
          alt={`QR Code: ${code}`}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="text-center space-y-1.5">
        {label && <p className="text-xs font-mono text-muted-foreground font-semibold">{label}</p>}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="h-7 px-2.5 text-[10px] border-white/10 hover:bg-white/5 gap-1 shrink-0 font-semibold uppercase tracking-wider"
        >
          <Download className="h-3 w-3" /> Download QR
        </Button>
      </div>
    </motion.div>
  )
}
