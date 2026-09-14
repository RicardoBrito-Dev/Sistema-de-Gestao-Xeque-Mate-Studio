"use client"

import React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import Badge from "@/components/ui/Badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Artist, KanbanCard, Session, KanbanStage } from "@/lib/types"
import { 
  Phone, 
  MessageCircle, 
  Instagram, 
  Play, 
  Youtube, 
  Music, 
  Calendar, 
  Clock, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Layers,
  Sparkles
} from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ArtistDetailSheetProps {
  artist: Artist | null
  isOpen: boolean
  onClose: () => void
  onEdit: (artist: Artist) => void
  onDelete: (id: string, name: string) => void
  canEdit: boolean
  kanbanCards: KanbanCard[]
  sessions: Session[]
}

const STAGE_PROGRESS: Record<KanbanStage, number> = {
  gravacao: 20,
  mix: 45,
  master: 70,
  recall: 85,
  entregue: 100,
}

const STAGE_LABELS: Record<KanbanStage, string> = {
  gravacao: "Gravação",
  mix: "Mixagem",
  master: "Masterização",
  recall: "Recall",
  entregue: "Entregue",
}

export default function ArtistDetailSheet({
  artist,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  canEdit,
  kanbanCards,
  sessions,
}: ArtistDetailSheetProps) {
  if (!artist) return null

  const cleanPhone = artist.phone.replace(/\D/g, "")
  const waUrl = cleanPhone
    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Fala ${artist.artisticName}, tudo certo? Passando pra falar sobre sua produção aqui na Xeque Mate!`)}`
    : null

  // Matching artist tracks
  const artistTracks = kanbanCards.filter(
    (c) =>
      c.artistName.toLowerCase() === artist.artisticName.toLowerCase() ||
      c.clientId === artist.id
  )

  // Matching artist sessions
  const today = format(new Date(), "yyyy-MM-dd")
  const artistSessions = sessions
    .filter(
      (s) =>
        s.clientName.toLowerCase() === artist.artisticName.toLowerCase() ||
        s.clientId === artist.id
    )
    .sort((a, b) => a.date.localeCompare(b.date))

  const upcomingSessions = artistSessions.filter((s) => s.date >= today)

  const fmt = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(val)

  const formatPhone = (p: string) => {
    const c = p.replace(/\D/g, "")
    if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`
    if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`
    return p
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg flex flex-col p-6 overflow-y-auto">
        {/* ─── Header ─── */}
        <SheetHeader className="pb-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-[#15803d]/40 shadow-lg shrink-0">
              {artist.avatar ? (
                <AvatarImage src={artist.avatar} alt={artist.artisticName} />
              ) : null}
              <AvatarFallback className="text-xl font-bebas text-[#4ade80] bg-[#141417]">
                {artist.artisticName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="text-2xl truncate">{artist.artisticName}</SheetTitle>
                <Badge
                  variant={artist.status === "ativo" ? "green" : artist.status === "pausado" ? "yellow" : "gray"}
                  size="sm"
                >
                  {artist.status}
                </Badge>
              </div>
              <SheetDescription className="mt-0.5 truncate">
                {artist.realName || "Artista da casa"} • <span className="uppercase text-[#22c55e] font-semibold">{artist.genre}</span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 mt-4">
          {/* ─── Quick Actions (WhatsApp, Instagram, etc.) ─── */}
          <div className="flex items-center gap-2">
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs transition-all shadow-sm active:scale-98"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Direto</span>
              </a>
            ) : null}

            {artist.instagram ? (
              <a
                href={`https://instagram.com/${artist.instagram.replace("@", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-white transition-colors"
                title="Instagram"
              >
                <Instagram size={16} />
              </a>
            ) : null}

            {artist.spotify ? (
              <a
                href={artist.spotify.startsWith("http") ? artist.spotify : `https://open.spotify.com/search/${encodeURIComponent(artist.artisticName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#1DB954] transition-colors"
                title="Spotify"
              >
                <Play size={16} />
              </a>
            ) : null}

            {artist.youtube ? (
              <a
                href={artist.youtube.startsWith("http") ? artist.youtube : `https://youtube.com/results?search_query=${encodeURIComponent(artist.artisticName)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] text-[#a1a1aa] hover:text-[#FF0000] transition-colors"
                title="YouTube"
              >
                <Youtube size={16} />
              </a>
            ) : null}
          </div>

          {/* ─── Bio ─── */}
          {artist.bio ? (
            <div className="p-3.5 rounded-xl bg-[#121214] border border-[#1e1e22]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#71717a] block mb-1">
                Bio / Descrição
              </span>
              <p className="text-xs text-[#d4d4d8] leading-relaxed italic">
                "{artist.bio}"
              </p>
            </div>
          ) : null}

          {/* ─── Metrics ─── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#121214] border border-[#1e1e22] text-center">
              <span className="text-[10px] text-[#71717a] uppercase tracking-widest font-semibold block">
                Total de Projetos
              </span>
              <span className="text-xl font-bebas text-white mt-1 block">
                {artist.projectCount}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#121214] border border-[#1e1e22] text-center">
              <span className="text-[10px] text-[#71717a] uppercase tracking-widest font-semibold block">
                Total Faturado
              </span>
              <span className="text-xl font-bebas text-[#22c55e] mt-1 block">
                {fmt(artist.totalRevenue)}
              </span>
            </div>
          </div>

          {/* ─── Músicas no Kanban ─── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music size={14} className="text-[#22c55e]" />
                <h4 className="font-bebas text-base tracking-wide text-white">
                  Músicas em Produção ({artistTracks.length})
                </h4>
              </div>
            </div>

            {artistTracks.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#222226] text-center">
                <p className="text-xs text-[#71717a]">Nenhuma música ativa no momento.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {artistTracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-3 rounded-xl bg-[#121214] border border-[#222226] space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-bebas text-sm text-white tracking-wide truncate">
                        {track.trackName}
                      </h5>
                      <span className="text-[10px] font-semibold text-[#22c55e] uppercase">
                        {STAGE_LABELS[track.stage]}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[9px] text-[#71717a]">
                        <span>Progresso</span>
                        <span>{STAGE_PROGRESS[track.stage]}%</span>
                      </div>
                      <Progress
                        value={STAGE_PROGRESS[track.stage]}
                        className="h-1 bg-[#1e1e22]"
                        indicatorClassName={track.stage === "entregue" ? "bg-emerald-400" : "bg-[#22c55e]"}
                      />
                    </div>

                    {track.driveLink ? (
                      <div className="pt-1">
                        <a
                          href={track.driveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-[#4ade80] hover:underline"
                        >
                          <span>Acessar Google Drive</span>
                          <ExternalLink size={9} />
                        </a>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Próximas Sessões ─── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#22c55e]" />
              <h4 className="font-bebas text-base tracking-wide text-white">
                Próximas Sessões ({upcomingSessions.length})
              </h4>
            </div>

            {upcomingSessions.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#222226] text-center">
                <p className="text-xs text-[#71717a]">Nenhuma sessão futura agendada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-[#121214] border border-[#222226] flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs font-semibold text-white capitalize">
                        {format(new Date(sess.date + "T12:00:00"), "EEEE, dd 'de' MMM", { locale: ptBR })}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#71717a]">
                        <span className="flex items-center gap-1">
                          <Clock size={11} className="text-[#22c55e]" />
                          {sess.startTime} - {sess.endTime}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{sess.serviceType}</span>
                      </div>
                    </div>

                    <Badge variant={sess.status === "confirmado" ? "green" : "gray"} size="sm">
                      {sess.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ─── Contact Info ─── */}
          <div className="p-3.5 rounded-xl bg-[#121214] border border-[#1e1e22] space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#71717a] block">
              Dados de Contato
            </span>
            <div className="flex items-center gap-2 text-xs text-[#d4d4d8]">
              <Phone size={12} className="text-[#71717a]" />
              <span>{formatPhone(artist.phone)}</span>
            </div>
            {artist.email ? (
              <div className="text-xs text-[#a1a1aa] truncate">
                {artist.email}
              </div>
            ) : null}
          </div>
        </div>

        {/* ─── Footer ─── */}
        {canEdit ? (
          <SheetFooter className="pt-4 border-t border-[#1e1e22] flex flex-row items-center justify-between gap-2 mt-6">
            <button
              onClick={() => {
                onClose()
                onDelete(artist.id, artist.artisticName)
              }}
              className="btn-secondary text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 text-xs py-2 px-3 border-rose-900/30"
            >
              <Trash2 size={13} />
              Excluir
            </button>
            <button
              onClick={() => {
                onClose()
                onEdit(artist)
              }}
              className="btn-primary text-xs py-2 px-4"
            >
              <Edit2 size={13} />
              Editar Dados
            </button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
