'use client'

import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/Sidebar'
import AuthGuard from '@/components/auth/AuthGuard'
import { useAuth } from '@/contexts/AuthContext'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'
import { GlobalCommandMenu } from '@/components/command/GlobalCommandMenu'
import { StudioAudioPlayer } from '@/components/audio/StudioAudioPlayer'
import { StudioLiveBadge } from '@/components/studio/StudioLiveBadge'
import { NotificationBell } from '@/components/notifications/NotificationBell'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'
  const isSharePage = pathname.startsWith('/share')
  const { user } = useAuth()

  if (isSharePage) {
    return (
      <AuthGuard>
        <AudioPlayerProvider>
          <StudioAudioPlayer />
          <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col">
            {children}
          </div>
        </AudioPlayerProvider>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      {isLoginPage ? (
        children
      ) : (
        <AudioPlayerProvider>
          <GlobalCommandMenu />
          <StudioAudioPlayer />
          <div className="relative flex flex-col md:flex-row flex-1 min-h-screen overflow-x-hidden bg-[#09090b]">
            <Sidebar />
            <main className="flex-1 w-full min-h-screen flex flex-col pt-16 pb-24 md:py-6 md:px-8 lg:px-12 min-w-0 transition-all duration-300 z-10">
              {/* Desktop Top Utility Bar */}
              <div className="hidden md:flex items-center justify-between pb-6 mb-2 border-b border-[#1e1e22]">
                <StudioLiveBadge />

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-command-menu'))}
                    className="px-3.5 py-1.5 rounded-xl bg-[#121214] border border-[#222226] hover:border-[#2e2e36] text-[#71717a] hover:text-[#f4f4f5] flex items-center gap-3 transition-all cursor-pointer text-xs group"
                  >
                    <span>Buscar no estúdio...</span>
                    <kbd className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#1c1c20] text-[#71717a] border border-[#27272a] group-hover:border-[#15803d]/40 group-hover:text-[#4ade80] transition-colors">
                      Ctrl K
                    </kbd>
                  </button>
                  <NotificationBell />
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="flex-1 flex flex-col w-full min-w-0"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </AudioPlayerProvider>
      )}
    </AuthGuard>
  )
}
