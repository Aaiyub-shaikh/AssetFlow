import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  CheckCircle2,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AssetFlowBrand, AssetFlowLogo } from '@/components/auth/assetflow-logo'
import { useAuthStore } from '@/stores'
import { departments } from '@/data/mock'
import toast from 'react-hot-toast'

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid work email'),
    department: z.string().min(1, 'Please select your department'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type SignupForm = z.infer<typeof signupSchema>

const benefits = [
  {
    title: 'Self-Service Asset Access',
    description: 'View all assets assigned to you and check their details anytime.',
  },
  {
    title: 'Seamless Resource Bookings',
    description: 'Reserve conference rooms, laptops, or vehicles with single-click scheduling.',
  },
  {
    title: 'Inter-department Transfers',
    description: 'Submit requests to transfer assets between teams quickly and securely.',
  },
  {
    title: 'Maintenance Updates',
    description: 'Report hardware faults and track repair progress directly.',
  },
]

export function SignupPage() {
  const navigate = useNavigate()
  const signup = useAuthStore((s) => s.signup)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', department: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (data: SignupForm) => {
    setLoading(true)
    try {
      const success = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
        department: data.department,
      })
      if (success) {
        toast.success('Welcome to AssetFlow!')
        navigate('/dashboard')
      }
    } catch {
      toast.error('An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg flex flex-col lg:flex-row">
      {/* Left side: marketing panel */}
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
              Get Started with <span className="gradient-text-accent">AssetFlow</span>.
            </h1>
            <p className="mt-4 text-sm text-muted-foreground max-w-lg leading-relaxed">
              Register your employee profile, select your department, and immediately begin managing your assets, logging bookings, and requesting allocations.
            </p>

            <div className="mt-10 lg:mt-12 space-y-5 max-w-lg">
              {benefits.map((benefit, i) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{benefit.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="text-xs text-muted-foreground/60 hidden lg:block">
          &copy; {new Date().getFullYear()} AssetFlow Systems. All rights reserved.
        </div>
      </div>

      {/* Right side: Signup Form */}
      <div className="relative z-10 flex items-center justify-center px-6 py-10 lg:px-12 lg:w-[480px] xl:w-[540px] shrink-0 bg-background/40 lg:border-l lg:border-border backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="auth-card w-full max-w-md p-8 lg:p-10"
        >
          <div className="flex flex-col items-center mb-6">
            <AssetFlowLogo size="md" showGlow />
            <h2 className="mt-6 text-xl font-bold text-white">Create Employee Account</h2>
            <p className="mt-1 text-xs text-muted-foreground text-center">
              Sign up as an employee to get access to company assets.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="space-y-1">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 h-10.5 bg-white/[0.03] border-white/10 rounded-xl focus:border-primary/50 text-sm"
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-danger">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="j.doe@company.com"
                  className="pl-10 h-10.5 bg-white/[0.03] border-white/10 rounded-xl focus:border-primary/50 text-sm"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label>Department</Label>
              <Select onValueChange={(v) => setValue('department', v)}>
                <SelectTrigger className="h-10.5 bg-white/[0.03] border-white/10 rounded-xl focus:border-primary/50 text-sm w-full">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Select department" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.name}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-xs text-danger">{errors.department.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10.5 bg-white/[0.03] border-white/10 rounded-xl focus:border-primary/50 text-sm"
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

            <div className="space-y-1">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-10.5 bg-white/[0.03] border-white/10 rounded-xl focus:border-primary/50 text-sm"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Info Box explaining Employee role restriction */}
            <div className="flex gap-2.5 items-start p-3 bg-white/[0.02] border border-white/5 rounded-xl text-muted-foreground">
              <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] leading-normal">
                You will be registered with an <strong>Employee</strong> role. Role permissions and promotions (to Department Head or Asset Manager) are managed strictly by organization Administrators.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10.5 rounded-xl mt-1 gradient-accent border-0 text-white font-semibold shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              {loading ? (
                <motion.div
                  className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white mx-auto"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create Employee Account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline hover:text-indigo-400 transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
