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
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getNavItemsForUser } from '@/lib/permissions'

const iconMap = {
  '/dashboard': LayoutDashboard,
  '/artists': Mic2,
  '/clients': Users,
  '/kanban': Kanban,
  '/schedule': Calendar,
  '/finances': DollarSign,
}

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
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
    <>
      {/* ════════════════════════════════════════════════
          DESKTOP SIDEBAR  (hidden on mobile)
      ════════════════════════════════════════════════ */}
      <aside
        className={`
          hidden md:flex flex-col flex-shrink-0 sticky top-0 left-0 h-screen
          bg-gradient-to-b from-[#0a0a0c] via-[#050505] to-[#010101] border-r border-[#1e1e1e] z-40
          transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[72px]' : 'w-60'}
        `}
        style={{ boxShadow: '2px 0 20px rgba(0,0,0,0.6)' }}
      >
        {/* ── Logo ── */}
        <div className={`
          flex items-center gap-3 border-b border-[#18181b]
          ${collapsed ? 'justify-center px-0 py-5' : 'px-5 py-5'}
        `}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center animate-pulse-gold">
              <Crown size={20} className="text-[#8B5CF6]" />
            </div>
          </div>
          {!collapsed && (
            <div>
              <span
                className="font-bebas text-xl tracking-widest leading-none block"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Xeque Mate
              </span>
              <span className="text-[9px] text-[#444] tracking-[0.25em] uppercase mt-0.5 block">Studio</span>
            </div>
          )}
        </div>

        {/* ── User info ── */}
        {!collapsed && user && (
          <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-[#0f0f0f] border border-[#1e1e1e]">
            <p className="text-xs font-medium text-[#F0F0F0] truncate">{user.name}</p>
            <div className="flex items-center gap-1.5 mt-1">
              {canEdit ? (
                <Shield size={10} className="text-[#8B5CF6]" />
              ) : (
                <Eye size={10} className="text-[#666]" />
              )}
              <span className={`text-[9px] uppercase tracking-wider font-bold ${canEdit ? 'text-[#8B5CF6]' : 'text-[#666]'}`}>
                {canEdit ? 'Admin' : 'Visualização'}
              </span>
            </div>
          </div>
        )}

        {/* ── Label section ── */}
        {!collapsed && (
          <div className="px-5 pt-5 pb-1">
            <span className="text-[9px] text-[#444] uppercase tracking-[0.2em] font-semibold">Menu</span>
          </div>
        )}

        {/* ── Navigation ── */}
        <nav className={`flex-1 overflow-y-auto py-2 space-y-1.5 ${collapsed ? 'px-2' : 'px-3'}`}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`
                  relative flex items-center gap-3
                  transition-all duration-200 group
                  ${collapsed ? 'justify-center p-3 rounded-xl' : 'px-3.5 py-2.5'}
                  ${active
                    ? 'bg-gradient-to-r from-[#8B5CF6]/10 to-transparent text-[#A78BFA] border-l-2 border-[#8B5CF6] rounded-r-lg rounded-l-none font-medium'
                    : 'text-[#666] hover:text-[#eee] hover:bg-white/[0.02] border-l-2 border-transparent rounded-lg'
                  }
                `}
              >
                <Icon
                  size={18}
                  className={`flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-[#A78BFA]' : ''}`}
                />

                {!collapsed && (
                  <span className="text-[13px] font-medium tracking-wide">
                    {label}
                  </span>
                )}

                {collapsed && (
                  <span className="
                    absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2
                    bg-[#1a1a1a] border border-[#222] text-[#F0F0F0]
                    text-xs font-medium rounded-lg px-3 py-1.5 whitespace-nowrap
                    opacity-0 group-hover:opacity-100 pointer-events-none
                    transition-all duration-200 -translate-x-2 group-hover:translate-x-0 z-50
                  ">
                    {label}
                  </span>
                )}
              </Link>
            )
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
              <span className="text-[8px] bg-[#8B5CF6]/10 text-[#A78BFA] px-1.5 py-0.5 rounded border border-[#8B5CF6]/20 font-bold uppercase tracking-wider">ON-AIR</span>
            </div>
          </div>
        )}

        {/* ── Logout ── */}
        <div className={`border-t border-[#1e1e1e] p-3 ${collapsed ? '' : 'px-4'}`}>
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
      </aside>

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
                      active ? 'text-[#A78BFA] scale-110' : 'text-[#555]'
                    }`}
                  />
                  <span
                    className={`text-[9px] font-semibold tracking-wide mt-1 transition-colors duration-200 ${
                      active ? 'text-[#A78BFA]' : 'text-[#555]'
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
    </>
  )
}
