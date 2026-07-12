'use client'

import { usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/auth/AuthGuard'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <AuthGuard>
      {isLoginPage ? (
        children
      ) : (
        <>
          <Sidebar />
          <main className="flex-1 min-h-screen flex flex-col pt-20 pb-28 md:py-8 md:pl-24 md:pr-16 min-w-0 transition-all duration-300">
            {children}
          </main>
        </>
      )}
    </AuthGuard>
  )
}
