'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

const PUBLIC_ROUTES = ['/login']

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, canAccessRoute } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/share')

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090b] w-screen h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#141417] border border-[#27272a] flex items-center justify-center shadow-lg">
            <span className="text-[#22c55e] font-bebas text-xl tracking-wider">XM</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-[#71717a] tracking-widest uppercase font-medium">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user && !isPublic) return null
  if (user && pathname === '/login') return null
  if (user && !isPublic && !canAccessRoute(pathname)) return null

  return <>{children}</>
}
