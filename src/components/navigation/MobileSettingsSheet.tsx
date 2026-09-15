"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import {
  Users,
  Calendar,
  DollarSign,
  Smartphone,
  Key,
  LogOut,
  Camera,
  Shield,
  Search,
  ChevronRight,
  Sparkles,
} from "lucide-react"

interface MobileSettingsSheetProps {
  isOpen: boolean
  onClose: () => void
  onOpenInstallPwa: () => void
  onOpenChangePassword: () => void
  onOpenAvatarModal: () => void
  onLogout: () => void
}

export function MobileSettingsSheet({
  isOpen,
  onClose,
  onOpenInstallPwa,
  onOpenChangePassword,
  onOpenAvatarModal,
  onLogout,
}: MobileSettingsSheetProps) {
  const { user, canEdit } = useAuth()
  const pathname = usePathname()

  const handleNavClick = () => {
    onClose()
  }

  const roleLabel =
    user?.role === "admin"
      ? "Administrador"
      : "Artista / Produtor"

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-[85vw] max-w-sm p-0 bg-[#0c0c0e] border-l border-[#1e1e24] flex flex-col justify-between">
        <div className="overflow-y-auto flex-1 px-5 py-6 space-y-6">
          <SheetHeader className="text-left space-y-1 pb-2 border-b border-[#1b1b20]">
            <SheetTitle className="text-base font-bold text-white flex items-center gap-2">
              <span>Menu & Configurações</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-[#71717a]">
              Acesso rápido a módulos, preferências e conta
            </SheetDescription>
          </SheetHeader>

          {/* ── Perfil do Usuário ── */}
          {user && (
            <div className="p-3.5 rounded-2xl bg-[#141418] border border-[#222228] flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenAvatarModal()
                }}
                className="relative group flex-shrink-0 cursor-pointer"
                title="Alterar foto de perfil"
              >
                <Avatar className="h-12 w-12 border-2 border-[#22c55e]/30">
                  {user.avatarUrl ? (
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                  ) : null}
                  <AvatarFallback className="text-[#4ade80] bg-[#1a1a1f] text-sm font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={14} className="text-white" />
                </div>
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  {canEdit && <Shield size={12} className="text-[#22c55e] flex-shrink-0" />}
                </div>
                <p className="text-xs text-[#71717a] truncate font-mono mt-0.5">
                  {roleLabel}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenAvatarModal()
                  }}
                  className="text-[10px] text-[#22c55e] hover:underline font-medium mt-1 flex items-center gap-1"
                >
                  <Camera size={10} />
                  Trocar foto
                </button>
              </div>
            </div>
          )}

          {/* ── Módulos Adicionais do Estúdio ── */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider px-1">
              Módulos do Estúdio
            </h4>
            <div className="space-y-1">
              <Link
                href="/schedule"
                onClick={handleNavClick}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  pathname.startsWith("/schedule")
                    ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80]"
                    : "bg-[#121215] border-[#1e1e24] text-[#d4d4d8] hover:bg-[#18181c]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18181e] border border-[#272730] flex items-center justify-center text-[#a1a1aa]">
                    <Calendar size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Agenda de Sessões</p>
                    <p className="text-[10px] text-[#71717a]">Horários e gravações</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#52525b]" />
              </Link>

              {canEdit && (
                <Link
                  href="/clients"
                  onClick={handleNavClick}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    pathname.startsWith("/clients")
                      ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80]"
                      : "bg-[#121215] border-[#1e1e24] text-[#d4d4d8] hover:bg-[#18181c]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#18181e] border border-[#272730] flex items-center justify-center text-[#a1a1aa]">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Clientes</p>
                      <p className="text-[10px] text-[#71717a]">Contratantes e contatos</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#52525b]" />
                </Link>
              )}

              {user?.role === "admin" && (
                <Link
                  href="/finances"
                  onClick={handleNavClick}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    pathname.startsWith("/finances")
                      ? "bg-[#22c55e]/10 border-[#22c55e]/30 text-[#4ade80]"
                      : "bg-[#121215] border-[#1e1e24] text-[#d4d4d8] hover:bg-[#18181c]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#18181e] border border-[#272730] flex items-center justify-center text-[#a1a1aa]">
                      <DollarSign size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Financeiro</p>
                      <p className="text-[10px] text-[#71717a]">Fluxo de caixa e balanço</p>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-[#52525b]" />
                </Link>
              )}
            </div>
          </div>

          {/* ── Aplicativo & Configurações ── */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[#52525b] uppercase tracking-wider px-1">
              Aplicativo & Atalhos
            </h4>
            <div className="space-y-1">
              {/* Instalar App PWA */}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenInstallPwa()
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#14532d]/30 to-[#121215] border border-[#22c55e]/30 text-white hover:border-[#22c55e]/60 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center text-[#4ade80] group-hover:scale-105 transition-transform">
                    <Smartphone size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-white">Instalar App no Celular</p>
                      <span className="text-[9px] font-bold bg-[#22c55e] text-black px-1.5 py-0.2 rounded-full uppercase">PWA</span>
                    </div>
                    <p className="text-[10px] text-[#86efac]">Acesso rápido como app nativo</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#86efac]" />
              </button>

              {/* Alterar Senha */}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenChangePassword()
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#121215] border border-[#1e1e24] text-[#d4d4d8] hover:bg-[#18181c] transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18181e] border border-[#272730] flex items-center justify-center text-[#a1a1aa]">
                    <Key size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Alterar Senha</p>
                    <p className="text-[10px] text-[#71717a]">Atualizar credenciais de login</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#52525b]" />
              </button>

              {/* Busca Global */}
              <button
                type="button"
                onClick={() => {
                  onClose()
                  window.dispatchEvent(new CustomEvent("open-command-menu"))
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-[#121215] border border-[#1e1e24] text-[#d4d4d8] hover:bg-[#18181c] transition-all text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#18181e] border border-[#272730] flex items-center justify-center text-[#a1a1aa]">
                    <Search size={15} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Busca Global</p>
                    <p className="text-[10px] text-[#71717a]">Pesquisar músicas, álbuns e artistas</p>
                  </div>
                </div>
                <ChevronRight size={14} className="text-[#52525b]" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Footer / Logout ── */}
        <div className="p-4 border-t border-[#1b1b20] bg-[#0a0a0c]">
          <button
            type="button"
            onClick={() => {
              onClose()
              onLogout()
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 font-semibold text-xs transition-all active:scale-98 cursor-pointer"
          >
            <LogOut size={14} />
            <span>Sair da Conta</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
