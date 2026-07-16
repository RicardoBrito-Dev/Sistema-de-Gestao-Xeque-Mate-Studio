'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthSession } from '@/lib/types'
import { getSession, login as authLogin, logout as authLogout } from '@/lib/auth'
import { getUsersAsync } from '@/lib/storage'
import { canEdit, canAccessRoute } from '@/lib/permissions'

interface AuthContextValue {
  user: AuthSession | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  updateUser: (patch: Partial<AuthSession>) => void
  canEdit: boolean
  canAccessRoute: (pathname: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const session = getSession()
      if (session) {
        try {
          const dbUsers = await getUsersAsync()
          const isValid = dbUsers.find(
            u => u.id === session.userId && (u.approved === true || u.role === 'admin')
          )
          if (isValid) {
            setUser(session)
            document.cookie = `xm_session=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
          } else {
            authLogout()
            setUser(null)
          }
        } catch {
          setUser(session)
          document.cookie = `xm_session=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }
      } else {
        document.cookie = `xm_session=; path=/; max-age=0`
      }
      setIsLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const session = await authLogin(email, password)
    if (session) {
      setUser(session)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setUser(null)
  }, [])

  const updateUser = useCallback((patch: Partial<AuthSession>) => {
    setUser(prev => prev ? { ...prev, ...patch } : prev)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateUser,
        canEdit: canEdit(user),
        canAccessRoute: (pathname: string) => canAccessRoute(pathname, user),
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
