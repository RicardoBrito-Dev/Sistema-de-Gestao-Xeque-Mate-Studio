"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { getSessionsAsync, getKanbanCardsAsync } from "@/lib/storage"
import { Bell, Check, Clock, AlertTriangle, Music, Calendar, Sparkles, X } from "lucide-react"
import { format, differenceInDays } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"

interface StudioNotification {
  id: string
  title: string
  description: string
  time: string
  type: "session" | "recall" | "deadline" | "system"
  link: string
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<StudioNotification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())
  const panelRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const [sessions, cards] = await Promise.all([
          getSessionsAsync(),
          getKanbanCardsAsync(),
        ])

        const alerts: StudioNotification[] = []
        const now = new Date()
        const todayStr = format(now, "yyyy-MM-dd")

        // 1. Sessions today
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

        // 2. Kanban cards in Recall
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

        // 3. Tracks with close deadlines
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

    loadAlerts()
  }, [])

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

  const markAllAsRead = () => {
    setReadIds(new Set(notifications.map((n) => n.id)))
  }

  const handleNotificationClick = (notif: StudioNotification) => {
    setReadIds((prev) => new Set(prev).add(notif.id))
    setIsOpen(false)
    router.push(notif.link)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative p-2.5 rounded-xl bg-[#121214] border border-[#222226] text-[#a1a1aa] hover:text-white hover:border-[#2e2e36] transition-all cursor-pointer active:scale-95"
        title="Notificações do Estúdio"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#15803d] text-[9px] font-bold text-white px-1 shadow-sm animate-in zoom-in-75">
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
            className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl bg-[#0e0e11] border border-[#222226] shadow-2xl shadow-black/80 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e22]">
              <div className="flex items-center gap-2">
                <span className="font-bebas text-base text-white tracking-wide">
                  Central de Notificações
                </span>
                {unreadCount > 0 && (
                  <span className="text-[10px] bg-[#15803d]/20 text-[#4ade80] px-2 py-0.5 rounded-full font-semibold">
                    {unreadCount} novas
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-[#71717a] hover:text-[#22c55e] transition-colors"
                >
                  Marcar lidas
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1.5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center">
                  <Check size={24} className="text-[#3f3f46] mx-auto mb-1.5" />
                  <p className="text-xs text-[#71717a]">Tudo limpo no estúdio!</p>
                  <p className="text-[11px] text-[#52525b] mt-0.5">Sem alertas pendentes no momento.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isRead = readIds.has(notif.id)
                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                        isRead
                          ? "bg-transparent border-transparent opacity-60 hover:opacity-100 hover:bg-[#141417]"
                          : "bg-[#141417] border-[#222226] hover:border-[#15803d]/40"
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-[#1a1a1e] text-[#22c55e] shrink-0 mt-0.5">
                        {notif.type === "session" && <Calendar size={13} />}
                        {notif.type === "recall" && <AlertTriangle size={13} className="text-rose-400" />}
                        {notif.type === "deadline" && <Clock size={13} className="text-gold" />}
                        {notif.type === "system" && <Sparkles size={13} />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h5 className="text-xs font-semibold text-white truncate">
                            {notif.title}
                          </h5>
                          <span className="text-[9px] text-[#71717a] shrink-0 uppercase font-mono">
                            {notif.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#a1a1aa] mt-0.5 line-clamp-2 leading-relaxed">
                          {notif.description}
                        </p>
                      </div>
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
