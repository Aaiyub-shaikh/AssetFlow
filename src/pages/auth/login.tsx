import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  UserCheck,
  Wrench,
  Bookmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AssetFlowBrand, AssetFlowLogo } from '@/components/auth/assetflow-logo'
import { useAuthStore, DEMO_CREDENTIALS } from '@/stores'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginForm = z.infer<typeof loginSchema>

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security with end-to-end encryption.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: Cloud,
    title: 'Multi-Tenant Architecture',
    description: 'Isolated resources with complete data governance.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Insights',
    description: 'Live inventory tracking & predictive analytics.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: GitBranch,
    title: 'Multi-Branch Control',
    description: 'Centralized management across global sites.',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Granular permissions for Admins, Managers & Employees.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  {
    icon: CheckCircle2,
    title: 'Audit Compliance',
    description: 'Effortless compliance tracking and reporting.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const success = await login(data.email, data.password)
      if (success) {
        toast.success('Logged in successfully!')
        navigate('/dashboard')
      } else {
        toast.error('Invalid email or password')
      }
    } catch {
      toast.error('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickLogin = async (email: string, pass: string) => {
    setValue('email', email)
    setValue('password', pass)
    setLoading(true)
    try {
      const success = await login(email, pass)
      if (success) {
        toast.success('Logged in with demo account!')
        navigate('/dashboard')
      } else {
        toast.error('Demo login failed')
      }
    } catch {
      toast.error('An error occurred during demo login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg flex flex-col lg:flex-row">
      {/* Left side: branding & marketing */}
      <div className="relative z-10 flex-1 flex flex-col px-6 py-8 lg:px-12 lg:py-10 justify-between">
        <AssetFlowBrand />

        <div className="flex-1 flex flex-col justify-center my-10 lg:my-0 lg:py-12">
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
            <p className="mt-4 text-sm text-muted-foreground max-w-lg leading-relaxed">
              Consolidate operations, track lifecycles, and optimize usage of all physical and software assets within a single platform.
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

        <div className="text-xs text-muted-foreground/60 hidden lg:block">
          &copy; {new Date().getFullYear()} AssetFlow Systems. All rights reserved.
        </div>
      </div>

      {/* Right side: Login form and demo credentials */}
      <div className="relative z-10 flex items-center justify-center px-6 py-10 lg:px-12 lg:w-[480px] xl:w-[540px] shrink-0 bg-background/40 lg:border-l lg:border-border backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="auth-card w-full max-w-md p-8 lg:p-10"
        >
          <div className="flex flex-col items-center mb-8">
            <AssetFlowLogo size="md" showGlow />
            <h2 className="mt-6 text-xl font-bold text-white">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted-foreground text-center">
              Please enter your credentials to access your account.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="pl-10 h-11 bg-white/[0.03] border-white/10 rounded-xl focus:border-primary/50 text-sm"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary hover:underline hover:text-primary-foreground transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-white/[0.03] border-white/10 rounded-xl focus:border-primary/50 text-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl mt-2 gradient-accent border-0 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Demo users section */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0b0f19] px-3 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                Or Quick Login Demo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {DEMO_CREDENTIALS.map((cred) => {
              let accentClass = ''
              let Icon = UserCheck
              if (cred.user.role === 'admin') {
                accentClass = 'border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-emerald-400'
                Icon = Shield
              } else if (cred.user.role === 'manager') {
                accentClass = 'border-blue-500/20 hover:border-blue-500/50 hover:bg-blue-500/5 text-blue-400'
                Icon = Wrench
              } else {
                accentClass = 'border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5 text-amber-400'
                Icon = Bookmark
              }

              return (
                <button
                  key={cred.email}
                  type="button"
                  onClick={() => handleQuickLogin(cred.email, cred.password)}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-xl border bg-white/[0.01] hover:-translate-y-0.5 transition-all text-left group cursor-pointer ${accentClass}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 group-hover:bg-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      {cred.user.role.charAt(0).toUpperCase() + cred.user.role.slice(1)} View
                      <span className="text-[9px] font-normal text-muted-foreground opacity-60 group-hover:opacity-100 transition-opacity">
                        {cred.password}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">{cred.email}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary font-medium hover:underline hover:text-indigo-400 transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
