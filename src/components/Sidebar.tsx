'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Mic2,
  Users,
  Kanban,
  Calendar,
  DollarSign,
  ChevronLeft,
  Crown,
  LogOut,
  Shield,
  Eye,
  Key,
  Camera,
  Smartphone,
  Search,
  Disc3,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { getNavItemsForUser } from '@/lib/permissions'
import ChangePasswordModal from '@/components/auth/ChangePasswordModal'
import AvatarModal from '@/components/auth/AvatarModal'
import InstallPwaModal from '@/components/pwa/InstallPwaModal'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { NotificationBell } from '@/components/notifications/NotificationBell'

const iconMap = {
  '/dashboard': LayoutDashboard,
  '/artists': Mic2,
  '/clients': Users,
  '/kanban': Kanban,
  '/albums': Disc3,
  '/schedule': Calendar,
  '/finances': DollarSign,
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isAvatarOpen, setIsAvatarOpen] = useState(false)
  const [isInstallPwaOpen, setIsInstallPwaOpen] = useState(false)
  const { user, logout, canEdit } = useAuth()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const navItems = getNavItemsForUser(user).map(item => ({
    ...item,
    icon: iconMap[item.href as keyof typeof iconMap],
  }))

  return (
    <TooltipProvider delayDuration={150}>
      {/* ════════════════════════════════════════════════
          DESKTOP SIDEBAR  (hidden on mobile)
      ════════════════════════════════════════════════ */}
      <div className="hidden md:flex flex-shrink-0">
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 72 : 240 }}
          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
          className="flex flex-col flex-shrink-0 sticky top-0 left-0 h-screen bg-gradient-to-b from-[#0a0a0c] via-[#050505] to-[#010101] border-r border-[#1e1e1e] z-40 overflow-hidden"
          style={{ boxShadow: '2px 0 20px rgba(0,0,0,0.6)' }}
        >
        {/* ── Logo ── */}
        <div className={`
          flex items-center gap-3 border-b border-[#1f1f23]
          ${collapsed ? 'justify-center px-0 py-5' : 'px-5 py-5'}
        `}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[#141417] border border-[#27272a] flex items-center justify-center">
              <Crown size={18} className="text-[#22c55e]" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <span className="font-bebas text-xl tracking-wider text-white leading-none block">
                Xeque Mate
              </span>
              <span className="text-[9px] text-[#71717a] tracking-[0.25em] uppercase mt-0.5 block font-medium">Studio</span>
            </div>
          )}
        </div>

        {/* ── User info ── */}
        {!collapsed && user && (
          <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e] flex items-center gap-3">
            <button
              onClick={() => setIsAvatarOpen(true)}
              className="relative group flex-shrink-0 cursor-pointer"
              title="Alterar foto de perfil"
            >
              <Avatar className="h-9 w-9 border border-[#16a34a]/30 transition-opacity group-hover:opacity-75">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-[#4ade80] bg-[#141417] text-[11px]">
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-[#000]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={10} className="text-white" />
              </div>
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-[#F0F0F0] truncate leading-none">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-1">
                {canEdit ? (
                  <Shield size={10} className="text-[#16a34a]" />
                ) : (
                  <Eye size={10} className="text-[#666]" />
                )}
                <span className={`text-[9px] uppercase tracking-wider font-bold ${canEdit ? 'text-[#16a34a]' : 'text-[#666]'}`}>
                  {canEdit ? 'Admin' : 'Artista'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── Search / Command Menu Trigger ── */}
        {!collapsed ? (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-menu'))}
            className="mx-3 mt-3 px-3 py-2 rounded-xl bg-[#0f0f11] border border-[#1e1e22] hover:border-[#2e2e36] text-[#71717a] hover:text-[#f4f4f5] flex items-center justify-between transition-all cursor-pointer text-xs group"
          >
            <span className="flex items-center gap-2">
              <Search size={13} className="group-hover:text-[#22c55e] transition-colors" />
              <span>Buscar...</span>
            </span>
            <kbd className="text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#1c1c20] text-[#71717a] border border-[#27272a] group-hover:border-[#15803d]/40 group-hover:text-[#4ade80] transition-colors">
              Ctrl K
            </kbd>
          </button>
        ) : (
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-menu'))}
            className="mx-auto mt-3 p-2.5 rounded-xl bg-[#0f0f11] border border-[#1e1e22] text-[#71717a] hover:text-[#22c55e] transition-all cursor-pointer"
            title="Buscar (Ctrl + K)"
          >
            <Search size={16} />
          </button>
        )}

        {/* ── Label section ── */}
        {!collapsed && (
          <div className="px-5 pt-4 pb-1">
            <span className="text-[9px] text-[#444] uppercase tracking-[0.2em] font-semibold">Menu</span>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className={`flex-1 overflow-y-auto py-2 space-y-1.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')

            const linkElement = (
              <Link
                href={href}
                className={`
                  relative flex items-center gap-3
                  transition-all duration-200 group
                  ${collapsed ? 'justify-center p-3 rounded-xl' : 'px-3.5 py-2.5'}
                  ${active
                    ? 'bg-gradient-to-r from-[#16a34a]/15 to-transparent text-[#4ade80] border-l-2 border-[#16a34a] rounded-r-lg rounded-l-none font-medium'
                    : 'text-[#666] hover:text-[#eee] hover:bg-white/[0.03] border-l-2 border-transparent rounded-lg'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#4ade80]' : ''}`}
                />

                {!collapsed && (
                  <span className="text-[13px] font-medium tracking-wide">
                    {label}
                  </span>
                )}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={href}>
                  <TooltipTrigger asChild>
                    {linkElement}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium text-xs">
                    {label}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={href}>{linkElement}</div>
          })}
        </nav>

        {/* ── ON-AIR Status Card ── */}
        {!collapsed && (
          <div className="px-4 py-3.5 mb-2 mx-3 rounded-xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-[#1e1e1e] flex flex-col gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[9px] text-[#555] uppercase tracking-wider font-semibold">Xeque Mate Studio</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bebas text-[#fff] tracking-wider">Sala Principal</span>
              <span className="text-[8px] bg-[#16a34a]/10 text-[#4ade80] px-1.5 py-0.5 rounded border border-[#16a34a]/20 font-bold uppercase tracking-wider">ON-AIR</span>
            </div>
          </div>
        )}

        {/* ── Logout & Security ── */}
        <div className={`border-t border-[#1e1e1e] p-3 ${collapsed ? '' : 'px-4'}`}>
          <button
            onClick={() => setIsInstallPwaOpen(true)}
            className={`
              w-full flex items-center gap-3 py-2.5 px-3 rounded-lg mb-1
              text-[#4ade80] bg-[#16a34a]/10 hover:bg-[#16a34a]/20 border border-[#16a34a]/20
              transition-all duration-200 group cursor-pointer
              ${collapsed ? 'justify-center' : ''}
            `}
            title="Instalar App no Celular ou PC"
          >
            <Smartphone size={15} className="flex-shrink-0 text-[#22c55e]" />
            {!collapsed && (
              <span className="text-[11px] font-semibold text-[#4ade80]">Instalar App</span>
            )}
          </button>

          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className={`
              w-full flex items-center gap-3 py-2.5 px-3 rounded-lg mb-1
              text-[#666] hover:text-[#4ade80] hover:bg-[#16a34a]/5
              transition-all duration-200 group
              ${collapsed ? 'justify-center' : ''}
            `}
            title="Alterar Senha"
          >
            <Key size={15} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-[11px] font-medium">Alterar Senha</span>
            )}
          </button>

          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 py-2.5 px-3 rounded-lg mb-1
              text-[#666] hover:text-[#E74C3C] hover:bg-[#C0392B]/5
              transition-all duration-200 group
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && (
              <span className="text-[11px] font-medium">Sair</span>
            )}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`
              w-full flex items-center gap-3 py-2.5 px-3 rounded-lg
              text-[#444] hover:text-[#888] hover:bg-[#111]
              transition-all duration-200 group
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <ChevronLeft
              size={15}
              className={`flex-shrink-0 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            />
            {!collapsed && (
              <span className="text-[11px] font-medium">Recolher menu</span>
            )}
          </button>
        </div>
      </motion.aside>
      </div>

      {/* ════════════════════════════════════════════════
          MOBILE TOP HEADER BAR
      ════════════════════════════════════════════════ */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a]/95 border-b border-[#1e1e1e] flex items-center justify-between px-4 z-50"
        style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 4px 30px rgba(0,0,0,0.6)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#141417] border border-[#27272a] flex items-center justify-center">
            <Crown size={14} className="text-[#22c55e]" />
          </div>
          <span className="font-bebas text-lg tracking-wider text-white leading-none block">
            Xeque Mate
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-command-menu'))}
            className="p-2 rounded-lg bg-[#141417] border border-[#27272a] text-[#a1a1aa] hover:text-white transition-all cursor-pointer active:scale-95"
            title="Buscar (Ctrl + K)"
          >
            <Search size={14} />
          </button>
          <NotificationBell />
          <button
            onClick={() => setIsInstallPwaOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-medium text-white bg-[#15803d] hover:bg-[#166534] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border border-white/10 active:scale-95 shadow-sm"
          >
            <Smartphone size={13} className="text-[#86efac]" />
            Instalar
          </button>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="flex items-center gap-1 text-[11px] font-medium text-[#a1a1aa] hover:text-white bg-[#18181b] border border-[#27272a] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <Key size={12} />
            Senha
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[11px] font-medium text-[#71717a] hover:text-rose-400 bg-[#18181b] border border-[#27272a] px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
          >
            <LogOut size={12} />
            Sair
          </button>
        </div>
      </header>

      {/* ════════════════════════════════════════════════
          MOBILE BOTTOM NAVIGATION BAR
      ════════════════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{ boxShadow: '0 -4px 30px rgba(0,0,0,0.8)' }}
      >
        <div
          className="bg-[#0a0a0a]/95 border-t border-[#1e1e1e]"
          style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <div className="flex items-center justify-around px-1 py-1.5 safe-area-pb">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center flex-1 py-1.5 transition-all duration-200"
                >
                  <Icon
                    size={20}
                    className={`transition-transform duration-200 ${
                      active ? 'text-[#4ade80] scale-110' : 'text-[#555]'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-semibold tracking-wide mt-1 transition-colors duration-200 ${
                      active ? 'text-[#4ade80]' : 'text-[#555]'
                    }`}
                  >
                    {label === 'Financeiro' ? 'Financ.' : label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Global Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Global Avatar Modal */}
      <AvatarModal
        isOpen={isAvatarOpen}
        onClose={() => setIsAvatarOpen(false)}
      />

      {/* Global PWA Install Modal */}
      <InstallPwaModal
        isOpen={isInstallPwaOpen}
        onClose={() => setIsInstallPwaOpen(false)}
      />
    </TooltipProvider>
  )
}
