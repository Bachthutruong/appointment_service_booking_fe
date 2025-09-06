import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  _id: string
  id?: string
  email: string
  name: string
  role: 'admin' | 'employee'
  phone?: string
  address?: string
  createdAt?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (user: User) => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user: User, token: string) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
      },
      
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null, isAuthenticated: false })
      },
      
      updateUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user))
        set({ user })
      },
      
      setUser: (user: User) => {
        localStorage.setItem('user', JSON.stringify(user))
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
