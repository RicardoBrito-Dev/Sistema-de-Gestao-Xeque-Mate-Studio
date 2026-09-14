"use client"

import React, { useEffect, useState } from "react"
import { getSessionsAsync } from "@/lib/storage"
import { Session } from "@/lib/types"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Radio, Mic2, Clock, Sparkles } from "lucide-react"

export function StudioLiveBadge() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [nextSession, setNextSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    try {
      const allSessions = await getSessionsAsync()
      const now = new Date()
      const todayStr = format(now, "yyyy-MM-dd")
      const currentHours = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTimeNum = currentHours * 60 + currentMinutes

      const todaySessions = allSessions
        .filter((s) => s.date === todayStr && s.status !== "cancelado")
        .sort((a, b) => a.startTime.localeCompare(b.startTime))

      // Check ongoing session
      let ongoing: Session | null = null
      let upcoming: Session | null = null

      for (const s of todaySessions) {
        const [startH, startM] = s.startTime.split(":").map(Number)
        const [endH, endM] = s.endTime.split(":").map(Number)
        const startNum = startH * 60 + (startM || 0)
        const endNum = endH * 60 + (endM || 0)

        if (currentTimeNum >= startNum && currentTimeNum <= endNum) {
          ongoing = s
          break
        } else if (currentTimeNum < startNum && !upcoming) {
          upcoming = s
        }
      }

      setCurrentSession(ongoing)
      setNextSession(upcoming)
    } catch (err) {
      console.error("Erro ao verificar status do estúdio:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 60000) // check every minute
    return () => clearInterval(interval)
  }, [])

  if (loading) return null

  if (currentSession) {
    return (
      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-rose-950/40 border border-rose-500/30 text-xs shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span className="font-bebas tracking-wide text-rose-400 text-sm leading-none uppercase">
          NO AR • GRAVANDO
        </span>
        <span className="text-[11px] text-[#f4f4f5] font-medium truncate max-w-[180px] sm:max-w-[280px]">
          {currentSession.clientName} ({currentSession.serviceType}) até {currentSession.endTime}
        </span>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#121214] border border-[#222226] text-xs">
      <span className="relative flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22c55e]"></span>
      </span>
      <span className="font-bebas tracking-wide text-[#4ade80] text-sm leading-none uppercase">
        ESTÚDIO LIVRE
      </span>
      <span className="text-[11px] text-[#71717a] hidden sm:inline truncate">
        {nextSession
          ? `• Próxima sessão às ${nextSession.startTime} (${nextSession.clientName})`
          : "• Sem sessões pendentes para hoje"}
      </span>
    </div>
  )
}
