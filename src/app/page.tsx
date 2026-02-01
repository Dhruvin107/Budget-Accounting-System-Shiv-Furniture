'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const router = useRouter()
  const { isAuthenticated, user, fetchUser, isLoading } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      fetchUser()
    }
  }, [mounted, fetchUser])

  useEffect(() => {
    if (mounted && !isLoading) {
      if (isAuthenticated && user) {
        if (user.role === 'admin') {
          router.push('/dashboard')
        } else {
          router.push('/portal')
        }
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, user, router, mounted, isLoading])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
