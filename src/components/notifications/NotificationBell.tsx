"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  getSessionsAsync,
  getKanbanCardsAsync,
  getUsersAsync,
  saveUser,
  deleteUser,
} from "@/lib/storage"
import {
  Bell,
  Check,
  Clock,
  AlertTriangle,
  Calendar,
  Sparkles,
  UserCheck,
  UserX,
  Volume2,
} from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/contexts/AuthContext"
import { AppUser } from "@/lib/types"
import { playNotificationSound } from "@/lib/notificationSound"

interface StudioNotification {
  id: string
  title: string
  description: string
  time: string
  type: "session" | "recall" | "deadline" | "system" | "user_approval"
  link: string
  user?: AppUser
}

export function NotificationBell() {
  const { user: currentUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<StudioNotification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const loadAlerts = async (shouldTriggerSound = false) => {
    try {
      const isAdmin = currentUser?.role === "admin"
      const [sessions, cards, allUsers] = await Promise.all([
        getSessionsAsync(),
        getKanbanCardsAsync(),
        isAdmin ? getUsersAsync() : Promise.resolve([]),
      ])

      const alerts: StudioNotification[] = []
      const now = new Date()
      const todayStr = format(now, "yyyy-MM-dd")

      // 0. Cadastros Pendentes de Aprovação (Apenas para Admin)
      if (isAdmin && allUsers.length > 0) {
        const pendingUsers = allUsers.filter(
          (u) => !u.approved && u.role !== "admin" && u.id !== "u1"
        )

        // Se houver novo usuário pendente não conhecido, toca o som do estúdio
        if (pendingUsers.length > 0 && shouldTriggerSound) {
          try {
            const rawKnown = localStorage.getItem("xm_known_pending_users")
            const knownIds: string[] = rawKnown ? JSON.parse(rawKnown) : []
            const hasNew = pendingUsers.some((u) => !knownIds.includes(u.id))

            if (hasNew) {
              playNotificationSound()
              localStorage.setItem(
                "xm_known_pending_users",
                JSON.stringify([...knownIds, ...pendingUsers.map((u) => u.id)])
              )
            }
          } catch {
            playNotificationSound()
          }
        }

        pendingUsers.forEach((u) => {
          alerts.push({
            id: `user-pending-${u.id}`,
            title: "Novo Cadastro Aguardando Aprovação",
            description: `${u.name} (${u.email}) aguarda liberação de acesso`,
            time: "Aprovação",
            type: "user_approval",
            link: "/artists",
            user: u,
          })
        })
      }

      // 1. Sessões agendadas para hoje
      const todaySessions = sessions.filter(
        (s) => s.date === todayStr && s.status !== "cancelado"
      )
      todaySessions.forEach((s) => {
        alerts.push({
          id: `sess-${s.id}`,
          title: "Sessão Agendada Hoje",
          description: `${s.clientName} (${s.serviceType}) às ${s.startTime}`,
          time: "Hoje",
          type: "session",
          link: "/schedule",
        })
      })

      // 2. Cards de Kanban em Recall
      const recallTracks = cards.filter((c) => c.stage === "recall")
      recallTracks.forEach((c) => {
        alerts.push({
          id: `recall-${c.id}`,
          title: "Ajuste / Recall Pendente",
          description: `"${c.trackName}" de ${c.artistName} aguarda alterações`,
          time: "Produção",
          type: "recall",
          link: "/kanban",
        })
      })

      // 3. Prazos de entrega próximos
      const deadlineTracks = cards.filter((c) => {
        if (!c.deadline || c.stage === "entregue") return false
        const diff = differenceInDays(new Date(c.deadline), now)
        return diff >= 0 && diff <= 3
      })
      deadlineTracks.forEach((c) => {
        alerts.push({
          id: `deadline-${c.id}`,
          title: "Prazo de Entrega Próximo",
          description: `"${c.trackName}" (${c.artistName}) vence em breve`,
          time: "Urgente",
          type: "deadline",
          link: "/kanban",
        })
      })

      setNotifications(alerts)
    } catch (err) {
      console.error("Erro ao carregar notificações:", err)
    }
  }

  useEffect(() => {
    loadAlerts(false)

    // Polling a cada 20 segundos para verificar novos cadastros ou sessões
    const timer = setInterval(() => {
      loadAlerts(true)
    }, 20000)

    // Ouve evento disparado no momento que alguém cadastra conta no app
    const handleNewUserRegistered = () => {
      loadAlerts(true)
    }

    window.addEventListener("xm:new-user-registered", handleNewUserRegistered)

    return () => {
      clearInterval(timer)
      window.removeEventListener("xm:new-user-registered", handleNewUserRegistered)
    }
  }, [currentUser?.role])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length
  const pendingApprovalsCount = notifications.filter(
    (n) => n.type === "user_approval" && !readIds.has(n.id)
  ).length

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  const handleNotificationClick = (notif: StudioNotification) => {
    setReadIds((prev) => new Set(prev).add(notif.id))
    setIsOpen(false)
    router.push(notif.link)
  }

  // ─── Ações Rápidas de Aprovação Direto na Notificação ───
  const handleApproveUser = (targetUser: AppUser, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedUser: AppUser = { ...targetUser, approved: true }
    try {
      saveUser(updatedUser)
      setNotifications((prev) => prev.filter((n) => n.id !== `user-pending-${targetUser.id}`))
      try {
        const rawKnown = localStorage.getItem("xm_known_pending_users")
        if (rawKnown) {
          const knownIds: string[] = JSON.parse(rawKnown)
          localStorage.setItem(
            "xm_known_pending_users",
            JSON.stringify(knownIds.filter((id) => id !== targetUser.id))
          )
        }
      } catch {}
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      alert("Erro ao aprovar usuário: " + msg)
    }
  }

  const handleRejectUser = (targetUser: AppUser, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`Tem certeza que deseja recusar e excluir o cadastro de ${targetUser.name}?`)) {
      try {
        deleteUser(targetUser.id)
        setNotifications((prev) => prev.filter((n) => n.id !== `user-pending-${targetUser.id}`))
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        alert("Erro ao recusar usuário: " + msg)
      }
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative p-2.5 rounded-xl border transition-all cursor-pointer active:scale-95 ${
          pendingApprovalsCount > 0
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:border-amber-500/50"
            : "bg-[#121214] border-[#222226] text-[#a1a1aa] hover:text-white hover:border-[#2e2e36]"
        }`}
        title={
          pendingApprovalsCount > 0
            ? `${pendingApprovalsCount} novo(s) cadastro(s) aguardando aprovação`
            : "Notificações do Estúdio"
        }
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full text-[9px] font-bold text-white px-1 shadow-sm animate-in zoom-in-75 ${
              pendingApprovalsCount > 0
                ? "bg-amber-500 shadow-amber-500/40 animate-pulse"
                : "bg-[#15803d]"
            }`}
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-[#0e0e11] border border-[#222226] shadow-2xl shadow-black/90 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e22]">
              <div className="flex items-center gap-2">
                <span className="font-bebas text-base text-white tracking-wide">
                  Central de Notificações
                </span>
                {unreadCount > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      pendingApprovalsCount > 0
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-[#15803d]/20 text-[#4ade80]"
                    }`}
                  >
                    {unreadCount} {unreadCount === 1 ? "nova" : "novas"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playNotificationSound}
                  className="p-1 rounded-md text-[#71717a] hover:text-[#4ade80] hover:bg-white/5 transition-all cursor-pointer"
                  title="Testar som de notificação"
                >
                  <Volume2 size={13} />
                </button>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] text-[#71717a] hover:text-[#22c55e] transition-colors cursor-pointer"
                  >
                    Marcar lidas
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Check size={24} className="text-[#3f3f46] mx-auto mb-1.5" />
                  <p className="text-xs text-[#71717a]">Tudo limpo no estúdio!</p>
                  <p className="text-[11px] text-[#52525b] mt-0.5">
                    Sem alertas pendentes no momento.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isRead = readIds.has(notif.id)
                  const isUserApproval = notif.type === "user_approval"

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isRead
                          ? "bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-[#141417]"
                          : isUserApproval
                          ? "bg-amber-500/[0.04] border-amber-500/20 hover:border-amber-500/40"
                          : "bg-[#141417] border-[#222226] hover:border-[#15803d]/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                            isUserApproval
                              ? "bg-amber-500/10 text-amber-400"
                              : notif.type === "session"
                              ? "bg-[#1a1a1e] text-[#22c55e]"
                              : notif.type === "recall"
                              ? "bg-[#1a1a1e] text-rose-400"
                              : notif.type === "deadline"
                              ? "bg-[#1a1a1e] text-amber-400"
                              : "bg-[#1a1a1e] text-[#22c55e]"
                          }`}
                        >
                          {isUserApproval && <UserCheck size={14} />}
                          {notif.type === "session" && <Calendar size={13} />}
                          {notif.type === "recall" && (
                            <AlertTriangle size={13} className="text-rose-400" />
                          )}
                          {notif.type === "deadline" && <Clock size={13} />}
                          {notif.type === "system" && <Sparkles size={13} />}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h5
                              className={`text-xs font-semibold truncate ${
                                isUserApproval ? "text-amber-200" : "text-white"
                              }`}
                            >
                              {notif.title}
                            </h5>
                            <span
                              className={`text-[9px] shrink-0 uppercase font-mono px-1.5 py-0.2 rounded ${
                                isUserApproval
                                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/20 font-bold"
                                  : "text-[#71717a]"
                              }`}
                            >
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#a1a1aa] mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.description}
                          </p>
                        </div>
                      </div>

                      {/* Botões de Ação Imediata para Cadastros Pendentes */}
                      {isUserApproval && notif.user && (
                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/[0.06]">
                          <button
                            type="button"
                            onClick={(e) => handleRejectUser(notif.user!, e)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#18181b] hover:bg-rose-500/20 text-[#a1a1aa] hover:text-rose-400 border border-[#27272a] hover:border-rose-500/40 text-[11px] font-medium transition-all active:scale-95 cursor-pointer"
                          >
                            <UserX size={12} />
                            <span>Recusar</span>
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleApproveUser(notif.user!, e)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black text-[11px] font-bold transition-all active:scale-95 cursor-pointer shadow-md shadow-[#22c55e]/20"
                          >
                            <Check size={12} className="stroke-[3]" />
                            <span>Aprovar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
