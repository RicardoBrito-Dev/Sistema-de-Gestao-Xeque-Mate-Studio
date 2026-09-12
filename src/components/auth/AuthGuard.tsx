'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const PUBLIC_ROUTES = ['/login']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, canAccessRoute } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublic = PUBLIC_ROUTES.includes(pathname)

  useEffect(() => {
    if (isLoading) return

    if (!user && !isPublic) {
      router.replace('/login')
      return
    }

    if (user && pathname === '/login') {
      router.replace('/dashboard')
      return
    }

    if (user && !isPublic && !canAccessRoute(pathname)) {
      router.replace('/dashboard')
    }
  }, [user, isLoading, pathname, isPublic, canAccessRoute, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060606]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#16a34a]/10 border border-[#16a34a]/30 flex items-center justify-center animate-pulse-gold">
            <span className="text-[#16a34a] font-bebas text-lg">XM</span>
          </div>
          <p className="text-xs text-[#555] tracking-widest uppercase">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user && !isPublic) return null
  if (user && pathname === '/login') return null
  if (user && !isPublic && !canAccessRoute(pathname)) return null

  return <>{children}</>
}
