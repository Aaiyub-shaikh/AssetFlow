import { motion } from 'framer-motion'

interface PremiumBackgroundProps {
  showGrid?: boolean
  className?: string
}

export function PremiumBackground({ showGrid = true, className = '' }: PremiumBackgroundProps) {
  return (
    <div className={`premium-bg absolute inset-0 -z-10 ${className}`}>
      {showGrid && <div className="absolute inset-0 grid-bg opacity-40" />}
      <motion.div
        className="blur-orb blur-orb-purple w-[500px] h-[500px] -top-32 -left-32"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blur-orb blur-orb-blue w-[400px] h-[400px] top-1/3 right-0"
        animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="blur-orb blur-orb-cyan w-[350px] h-[350px] bottom-0 left-1/3"
        animate={{ x: [0, 25, 0], y: [0, -15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
