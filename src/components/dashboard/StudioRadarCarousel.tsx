"use client"

import React from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  Calendar, 
  Clock, 
  Disc3, 
  ArrowUpRight, 
  Radio, 
  ChevronRight, 
  Sparkles,
  Layers,
  Music2
} from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Badge from "@/components/ui/Badge"
import { Session, KanbanCard } from "@/lib/types"

interface StudioRadarCarouselProps {
  sessions: Session[]
  activeTracks: KanbanCard[]
  canEdit: boolean
}

export default function StudioRadarCarousel({
  sessions,
  activeTracks,
  canEdit,
}: StudioRadarCarouselProps) {
  const today = format(new Date(), "yyyy-MM-dd")
  const todaySessions = sessions.filter(
    (s) => s.date === today && s.status !== "cancelado"
  )
  const upcomingSessions = sessions.filter(
    (s) => s.date >= today && s.status !== "cancelado"
  ).slice(0, 5)

  // Prioritize today's sessions, then upcoming, then active tracks
  const displaySessions = todaySessions.length > 0 ? todaySessions : upcomingSessions
  const displayTracks = activeTracks.slice(0, 6)

  const hasItems = displaySessions.length > 0 || displayTracks.length > 0

  if (!hasItems) {
    return null
  }

  const getStageBadge = (stage: KanbanCard["stage"]) => {
    switch (stage) {
      case "gravacao":
        return <Badge variant="green" size="sm">Gravação</Badge>
      case "mix":
        return <Badge variant="gold" size="sm">Mixagem</Badge>
      case "master":
        return <Badge variant="gray" size="sm">Masterização</Badge>
      case "recall":
        return <Badge variant="crimson" size="sm">Recall / Ajustes</Badge>
      default:
        return <Badge variant="gray" size="sm">{stage}</Badge>
    }
  }

  return (
    <div className="w-full space-y-3.5">
      {/* ─── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#15803d]/15 border border-[#15803d]/30 text-[#22c55e]">
            <Radio size={14} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-bebas text-lg tracking-wider text-white leading-none">
              No Radar do Estúdio
            </h3>
            <p className="text-[11px] text-[#71717a] mt-0.5">
              Sessões agendadas e faixas em produção ativa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={canEdit ? "/schedule" : "/kanban"}
            className="group flex items-center gap-1 text-xs font-medium text-[#a1a1aa] hover:text-[#22c55e] transition-colors"
          >
            <span>Ver tudo</span>
            <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* ─── Carousel ───────────────────────────────────────── */}
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <div className="relative">
          <CarouselContent className="-ml-3">
            {/* 1. Cards de Sessões */}
            {displaySessions.map((session) => {
              const isToday = session.date === today
              return (
                <CarouselItem
                  key={`session-${session.id}`}
                  className="pl-3 basis-[280px] sm:basis-[320px] md:basis-[340px] shrink-0"
                >
                  <div className="group relative flex h-full flex-col justify-between rounded-xl border border-[#222226] bg-[#121214] p-4 transition-all duration-200 hover:border-[#2e2e36] hover:bg-[#151518]">
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          isToday 
                            ? "bg-[#15803d]/20 text-[#4ade80] border border-[#15803d]/30" 
                            : "bg-[#27272a] text-[#a1a1aa] border border-white/5"
                        }`}>
                          <Calendar size={10} />
                          {isToday ? "Sessão Hoje" : format(new Date(session.date + "T12:00:00"), "dd 'de' MMM", { locale: ptBR })}
                        </span>

                        <Badge variant={session.status === "confirmado" ? "green" : "gray"} size="sm">
                          {session.serviceType}
                        </Badge>
                      </div>

                      {/* Client info with Avatar */}
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-[#27272a] bg-[#18181b]">
                          <AvatarFallback className="text-[#22c55e] bg-[#141417]">
                            {session.clientName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bebas text-base tracking-wide text-white truncate group-hover:text-[#4ade80] transition-colors">
                            {session.title || session.clientName}
                          </h4>
                          <p className="text-xs text-[#a1a1aa] truncate">
                            {session.clientName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bottom info */}
                    <div className="mt-4 pt-3 border-t border-[#1e1e22] flex items-center justify-between text-xs text-[#71717a]">
                      <div className="flex items-center gap-1 text-[#d4d4d8] font-medium">
                        <Clock size={12} className="text-[#22c55e]" />
                        <span>{session.startTime} - {session.endTime}</span>
                      </div>

                      <Link
                        href="/schedule"
                        className="inline-flex items-center gap-1 text-[11px] text-[#71717a] hover:text-white transition-colors"
                      >
                        <span>Agenda</span>
                        <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                </CarouselItem>
              )
            })}

            {/* 2. Cards de Faixas Ativas no Kanban */}
            {displayTracks.map((track) => (
              <CarouselItem
                key={`track-${track.id}`}
                className="pl-3 basis-[280px] sm:basis-[320px] md:basis-[340px] shrink-0"
              >
                <div className="group relative flex h-full flex-col justify-between rounded-xl border border-[#222226] bg-[#121214] p-4 transition-all duration-200 hover:border-[#2e2e36] hover:bg-[#151518]">
                  <div>
                    {/* Top status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Music2 size={12} className="text-[#22c55e]" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-[#71717a]">
                          Faixa Ativa
                        </span>
                      </div>
                      {getStageBadge(track.stage)}
                    </div>

                    {/* Artist & Track info with Avatar */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-[#27272a] bg-[#18181b]">
                        <AvatarFallback className="text-[#4ade80] bg-[#141417]">
                          {track.artistName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bebas text-base tracking-wide text-white truncate group-hover:text-[#4ade80] transition-colors">
                          {track.trackName}
                        </h4>
                        <p className="text-xs text-[#a1a1aa] truncate">
                          {track.artistName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="mt-4 pt-3 border-t border-[#1e1e22] flex items-center justify-between text-xs text-[#71717a]">
                    <div className="flex items-center gap-1">
                      <Layers size={11} />
                      <span>{track.daysInStage === 0 ? "Hoje" : `${track.daysInStage}d no estágio`}</span>
                    </div>

                    <Link
                      href="/kanban"
                      className="inline-flex items-center gap-1 text-[11px] text-[#71717a] hover:text-white transition-colors"
                    >
                      <span>Quadro</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Desktop Navigation Arrows */}
          <div className="hidden md:block">
            <CarouselPrevious className="left-[-14px] bg-[#121214] border-[#27272a] text-white hover:bg-[#18181b]" />
            <CarouselNext className="right-[-14px] bg-[#121214] border-[#27272a] text-white hover:bg-[#18181b]" />
          </div>
        </div>
      </Carousel>
    </div>
  )
}
