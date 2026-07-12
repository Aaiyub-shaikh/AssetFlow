import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AssetFlowBrand } from '@/components/auth/assetflow-logo'
import { useAuthStore } from '@/stores'
import toast from 'react-hot-toast'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid work email address'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const forgotPassword = useAuthStore((s) => s.forgotPassword)
  const [loading, setLoading] = useState(false)
  const [sentEmail, setSentEmail] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setLoading(true)
    try {
      const exists = await forgotPassword(data.email)
      if (exists) {
        setSentEmail(data.email)
        toast.success('Reset link sent to your inbox!')
      } else {
        toast.error('No employee account found with this email')
      }
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-6 relative">
      {/* Decorative floating blur orbs */}
      <div className="blur-orb blur-orb-purple h-80 w-80 top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      <div className="blur-orb blur-orb-blue h-96 w-96 bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 opacity-25" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <AssetFlowBrand />
        </div>

        <div className="auth-card p-8 lg:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!sentEmail ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col items-center mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h2 className="text-xl font-bold text-white text-center">Forgot your password?</h2>
                  <p className="mt-1.5 text-xs text-muted-foreground text-center max-w-xs">
                    Enter your registered work email address below and we'll send you instructions to reset your password.
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
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <div className="mt-6 flex justify-center">
                  <Link
                    to="/login"
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors group"
                  >
                    <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                    Back to login
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto mb-4 animate-bounce-short">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                  We've sent a password reset link to <strong className="text-white">{sentEmail}</strong>. Please check your inbox and follow the instructions to secure your account.
                </p>

                <div className="space-y-4">
                  <Link to="/login" className="block">
                    <Button variant="outline" className="w-full h-11 rounded-xl border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-white font-medium cursor-pointer">
                      Return to Login
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Didn't receive the email?{' '}
                    <button
                      type="button"
                      onClick={() => handleResend(sentEmail)}
                      className="text-primary hover:underline font-medium cursor-pointer"
                    >
                      Resend link
                    </button>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )

  function handleResend(email: string) {
    toast.promise(forgotPassword(email), {
      loading: 'Sending...',
      success: 'Reset link resent successfully!',
      error: 'Failed to resend reset link.',
    })
  }
}
