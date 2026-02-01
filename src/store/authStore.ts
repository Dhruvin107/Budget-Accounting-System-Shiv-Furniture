import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api'

interface User {
  _id: string
  email: string
  full_name: string
  role: 'admin' | 'portal_user' | 'vendor'
  contact_id?: string
  is_active: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: { email: string; password: string; full_name: string }) => Promise<User>
  logout: () => void
  fetchUser: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const response = await authApi.login(email, password)
          const { user, access_token, refresh_token } = response.data
          
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          
          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(data)
          const { user, access_token, refresh_token } = response.data
          
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', refresh_token)
          
          set({ user, isAuthenticated: true, isLoading: false })
          return user
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },

      fetchUser: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
          set({ user: null, isAuthenticated: false, isLoading: false })
          return
        }

        const currentState = get()
        if (currentState.user && currentState.isAuthenticated) {
          set({ isLoading: false })
          return
        }

        set({ isLoading: true })
        try {
          const response = await authApi.me()
          set({ user: response.data.user || response.data, isAuthenticated: true, isLoading: false })
        } catch (error: any) {
          if (error.response?.status === 401) {
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            set({ user: null, isAuthenticated: false, isLoading: false })
          } else {
            set({ isLoading: false })
          }
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
