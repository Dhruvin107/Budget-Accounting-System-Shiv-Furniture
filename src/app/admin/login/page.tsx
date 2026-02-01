'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Eye, EyeOff, Shield, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const user = await login(data.email, data.password)
      if (user.role !== 'admin') {
        toast.error('Access denied. Admin credentials required.')
        return
      }
      toast.success('Welcome back, Admin!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 mt-2">Shiv Furniture ERP System</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Administrator Login</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@shivfurniture.com"
                  {...register('email')}
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
                {errors.email && (
                  <p className="text-sm text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-400">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Sign In as Admin
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-center text-sm text-slate-400">
                Customer or Vendor?{' '}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                  Login to Portal
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">
          © 2026 Shiv Furniture Systems. All rights reserved.
        </p>
      </div>
    </div>
  )
}
