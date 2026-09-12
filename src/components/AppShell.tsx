'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const { user } = useAuth()

  return (
    <AuthGuard>
      {isLoginPage ? (
        children
      ) : (
        <div className="relative flex flex-1 min-h-screen overflow-hidden">
          {/* Faded Profile Picture Wallpaper Backdrop */}
          {user?.avatarUrl && (
            <div 
              className="absolute top-0 left-0 right-0 h-[420px] pointer-events-none overflow-hidden z-0 select-none transition-all duration-700 ease-in-out"
              style={{
                backgroundImage: `url(${user.avatarUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 25%',
                opacity: 0.14,
                filter: 'blur(8px)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0) 100%)',
              }}
            />
          )}
          <Sidebar />
          <main className="flex-1 min-h-screen flex flex-col pt-20 pb-28 md:py-8 md:px-16 min-w-0 transition-all duration-300 z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex-1 flex flex-col w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      )}
    </AuthGuard>
  )
}
