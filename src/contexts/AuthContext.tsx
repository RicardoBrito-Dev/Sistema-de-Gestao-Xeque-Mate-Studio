'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { AuthSession } from '@/lib/types'
import { getSession, login as authLogin, logout as authLogout } from '@/lib/auth'
import { canEdit, canAccessRoute } from '@/lib/permissions'

interface AuthContextValue {
  user: AuthSession | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  canEdit: boolean
  canAccessRoute: (pathname: string) => boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setUser(getSession())
    setIsLoading(false)
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
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
