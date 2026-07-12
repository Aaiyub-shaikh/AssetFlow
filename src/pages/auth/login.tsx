import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Shield,
  Cloud,
  BarChart3,
  GitBranch,
  Users,
  CheckCircle2,
  Building2,
  ArrowRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AssetFlowBrand, AssetFlowLogo } from '@/components/auth/assetflow-logo'
import { useAuthStore } from '@/stores'
import toast from 'react-hot-toast'

const accessSchema = z.object({
  accessCode: z
    .string()
    .min(2, 'Please enter a valid access code')
    .max(20, 'Access code is too long'),
})

type AccessForm = z.infer<typeof accessSchema>

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with encryption.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Cloud,
    title: 'Multi-Tenant Architecture',
    description: 'Complete data isolation.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Insights',
    description: 'Live analytics & dashboards.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: GitBranch,
    title: 'Multi Branch Control',
    description: 'Centralized governance.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Users,
    title: 'Role Based Access',
    description: 'Permission-driven operations.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: CheckCircle2,
    title: 'Scalable Infrastructure',
    description: 'Built for growing organizations.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessForm>({
    resolver: zodResolver(accessSchema),
    defaultValues: { accessCode: '' },
  })

  const onSubmit = async (data: AccessForm) => {
    setLoading(true)
    try {
      const success = await login(`${data.accessCode}@workspace.local`, '')
      if (success) {
        toast.success('Welcome to your workspace!')
        navigate('/dashboard')
      } else {
        toast.error('Invalid access code')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSSO = () => {
    toast('SSO integration coming soon', { icon: '🔐' })
  }

  return (
    <div className="min-h-screen auth-bg flex flex-col lg:flex-row">
      <div className="relative z-10 flex-1 flex flex-col px-6 py-8 lg:px-12 lg:py-10">
        <AssetFlowBrand />

        <div className="flex-1 flex flex-col justify-center mt-10 lg:mt-0 lg:py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight text-white">
              Enterprise Asset Management.
            </h1>
            <p className="mt-2 text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-tight gradient-text-accent">
              Simplified. Secured. Scaled.
            </p>

            <div className="mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="feature-card p-4 lg:p-5"
                >
                  <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${feature.bg} mb-3`}>
                    <feature.icon className={`h-4 w-4 ${feature.color}`} />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-center px-6 py-10 lg:px-12 lg:w-[480px] xl:w-[520px] shrink-0">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="auth-card w-full max-w-md p-8 lg:p-10"
        >
          <div className="flex flex-col items-center mb-8">
            <AssetFlowLogo size="lg" showGlow />
            <h2 className="mt-6 text-xl font-bold text-white">Welcome to AssetFlow</h2>
            <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed">
              Enter your company access code to continue to your secure workspace.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <div className="relative">
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="accessCode"
                  placeholder="e.g. mdfc, abc, xyz"
                  className="pl-10 h-12 bg-white/[0.03] border-white/10 rounded-xl"
                  {...register('accessCode')}
                />
              </div>
              {errors.accessCode && (
                <p className="text-xs text-danger">{errors.accessCode.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl gradient-accent border-0 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  Access Workspace
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0c0c14] px-4 text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Login with SSO
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleSSO}
            className="w-full h-12 rounded-xl border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white font-medium"
          >
            Microsoft / Google
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
