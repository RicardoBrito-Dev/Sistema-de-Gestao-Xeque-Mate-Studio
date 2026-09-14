'use client'

import React, { useEffect, useState } from 'react'
import { 
  getArtistsAsync, 
  deleteArtist, 
  getKanbanCardsAsync, 
  getSessionsAsync 
} from '@/lib/storage'
import { Artist, KanbanCard, Session, KanbanStage } from '@/lib/types'
import ArtistModal from '@/components/artists/ArtistModal'
import UsersModal from '@/components/artists/UsersModal'
import ArtistDetailSheet from '@/components/artists/ArtistDetailSheet'
import Badge from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { filterArtistsForUser } from '@/lib/permissions'
import { 
  Mic2, 
  Plus, 
  Search, 
  Instagram, 
  Play, 
  Youtube, 
  Trash2, 
  Edit2, 
  Phone, 
  Users, 
  MessageCircle, 
  Music, 
  Calendar, 
  Clock, 
  ExternalLink, 
  TrendingUp, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
}

const STAGE_PROGRESS: Record<KanbanStage, number> = {
  gravacao: 20,
  mix: 45,
  master: 70,
  recall: 85,
  entregue: 100,
}

const STAGE_LABELS: Record<KanbanStage, string> = {
  gravacao: 'Gravação',
  mix: 'Mixagem',
  master: 'Masterização',
  recall: 'Recall',
  entregue: 'Entregue',
}

export default function ArtistsPage() {
  const { user, canEdit } = useAuth()
  const [artists, setArtists] = useState<Artist[]>([])
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [search, setSearch] = useState('')
  const [genreFilter, setGenreFilter] = useState('todos')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [detailArtist, setDetailArtist] = useState<Artist | null>(null)
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)

  const loadData = async () => {
    const [arts, cards, sess] = await Promise.all([
      getArtistsAsync(),
      getKanbanCardsAsync(),
      getSessionsAsync(),
    ])
    setArtists(filterArtistsForUser(arts, user))
    setKanbanCards(cards)
    setSessions(sess)
  }

  useEffect(() => {
    loadData()
  }, [user])

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Excluir artista "${name}"?`)) {
      setArtists((prev) => prev.filter((a) => a.id !== id))
      deleteArtist(id)
      if (detailArtist?.id === id) {
        setIsDetailOpen(false)
        setDetailArtist(null)
      }
    }
  }

  const handleEdit = (artist: Artist) => {
    setSelectedArtist(artist)
    setIsModalOpen(true)
  }

  const handleNew = () => {
    setSelectedArtist(null)
    setIsModalOpen(true)
  }

  const handleOpenDetail = (artist: Artist) => {
    setDetailArtist(artist)
    setIsDetailOpen(true)
  }

  // Filtered artists
  const filtered = artists.filter((a) => {
    const query = search.toLowerCase()
    const matchesSearch =
      a.artisticName.toLowerCase().includes(query) ||
      a.realName.toLowerCase().includes(query) ||
      a.genre.toLowerCase().includes(query)

    const matchesGenre =
      genreFilter === 'todos' || a.genre.toLowerCase() === genreFilter.toLowerCase()

    return matchesSearch && matchesGenre
  })

  // Casting KPIs
  const activeCount = artists.filter((a) => a.status === 'ativo').length
  const tracksInProduction = kanbanCards.filter((c) => c.stage !== 'entregue').length

  // Find dominant genre
  const genreCounts: Record<string, number> = {}
  artists.forEach((a) => {
    genreCounts[a.genre] = (genreCounts[a.genre] || 0) + 1
  })
  const dominantGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Funk'

  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)

  const statusColor: Record<Artist['status'], 'green' | 'yellow' | 'gray'> = {
    ativo: 'green',
    pausado: 'yellow',
    inativo: 'gray',
  }

  const formatPhone = (p: string) => {
    const c = p.replace(/\D/g, '')
    if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`
    if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`
    return p
  }

  // For artist personal portal: current logged-in artist
  const currentArtist = artists[0] || null
  const myTracks = currentArtist
    ? kanbanCards.filter(
        (c) =>
          c.artistName.toLowerCase() === currentArtist.artisticName.toLowerCase() ||
          c.clientId === currentArtist.id
      )
    : []
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const mySessions = currentArtist
    ? sessions
        .filter(
          (s) =>
            (s.clientName.toLowerCase() === currentArtist.artisticName.toLowerCase() ||
              s.clientId === currentArtist.id) &&
            s.date >= todayStr &&
            s.status !== 'cancelado'
        )
        .sort((a, b) => a.date.localeCompare(b.date))
    : []

  return (
    <div className="flex-1 w-full animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-6">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1e1e1e]">
          <div>
            <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">
              {canEdit ? 'Artistas da Produtora' : 'Meu Perfil Artístico'}
            </h1>
            <p className="text-sm text-[#888] mt-1.5">
              {canEdit
                ? 'Gerencie o casting, produções ativas e contatos da Xeque Mate'
                : 'Acompanhe seu fluxo de produções, sessões e presença no estúdio'}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-2.5 flex-wrap">
              <Button onClick={() => setIsUsersModalOpen(true)} variant="secondary" size="default">
                <Users size={15} />Gerenciar Contas
              </Button>
              <Button onClick={handleNew} variant="default" size="default">
                <Plus size={15} />Novo Artista
              </Button>
            </div>
          )}
        </div>

        {canEdit ? (
          <>
            {/* ─── Admin: Mini KPIs do Casting ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0f0f11] border border-[#1e1e22] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-widest block">
                    Artistas Ativos
                  </span>
                  <span className="text-2xl font-bebas text-white mt-0.5 block">
                    {activeCount} <span className="text-xs text-[#52525b] font-sans font-normal">no casting</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#15803d]/15 border border-[#15803d]/25 text-[#22c55e]">
                  <Mic2 size={18} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f0f11] border border-[#1e1e22] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-widest block">
                    Faixas em Produção
                  </span>
                  <span className="text-2xl font-bebas text-[#4ade80] mt-0.5 block">
                    {tracksInProduction} <span className="text-xs text-[#52525b] font-sans font-normal">ativas</span>
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#15803d]/15 border border-[#15803d]/25 text-[#22c55e]">
                  <Music size={18} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0f0f11] border border-[#1e1e22] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#71717a] uppercase font-bold tracking-widest block">
                    Gênero Mais Gravado
                  </span>
                  <span className="text-2xl font-bebas text-white uppercase mt-0.5 block">
                    {dominantGenre}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>

            {/* ─── Filters Bar (Search + Genre Tabs) ─── */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={14} />
                  <input
                    type="text"
                    className="input-dark pl-9 text-xs"
                    placeholder="Buscar por nome ou estilo..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Genre Tabs */}
                <Tabs value={genreFilter} onValueChange={setGenreFilter} className="w-full sm:w-auto overflow-x-auto">
                  <TabsList className="bg-[#0f0f11] border-[#1e1e22] p-1 flex-wrap sm:flex-nowrap">
                    <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
                    <TabsTrigger value="funk" className="text-xs">Funk</TabsTrigger>
                    <TabsTrigger value="rap" className="text-xs">Rap</TabsTrigger>
                    <TabsTrigger value="dj" className="text-xs">DJ</TabsTrigger>
                    <TabsTrigger value="trap" className="text-xs">Trap</TabsTrigger>
                    <TabsTrigger value="outro" className="text-xs">Outro</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex items-center justify-between text-xs text-[#71717a] px-1">
                <span>Exibindo {filtered.length} de {artists.length} artistas</span>
                <span className="text-[11px] text-[#52525b] hidden sm:inline">
                  💡 Clique no card para ver a ficha completa com faixas e sessões
                </span>
              </div>
            </div>

            {/* ─── Cards Grid ─── */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 border border-dashed border-[#222] rounded-2xl bg-[#0a0a0c]/50">
                <Mic2 size={32} className="text-[#333] mb-2" />
                <p className="text-sm text-[#71717a] font-medium">Nenhum artista encontrado</p>
                <p className="text-xs text-[#52525b] mt-0.5">Tente outro filtro ou cadastre um novo artista.</p>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filtered.map((artist) => {
                  const cleanPhone = artist.phone.replace(/\D/g, '')
                  const waUrl = cleanPhone
                    ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Fala ${artist.artisticName}, tudo bem? Passando para falar sobre sua produção aqui na Xeque Mate!`)}`
                    : null

                  const artistActiveTracks = kanbanCards.filter(
                    (c) =>
                      (c.artistName.toLowerCase() === artist.artisticName.toLowerCase() ||
                        c.clientId === artist.id) &&
                      c.stage !== 'entregue'
                  )

                  return (
                    <motion.div
                      key={artist.id}
                      variants={itemVariants}
                      whileHover={{ y: -3, transition: { duration: 0.15 } }}
                      onClick={() => handleOpenDetail(artist)}
                      className="group cursor-pointer bg-[#111114] border border-[#222226] hover:border-[#2e2e36] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-xl hover:shadow-black/60"
                    >
                      <div>
                        {/* Top: Avatar + Name + Edit/Delete */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar className="h-12 w-12 border border-[#27272a] group-hover:border-[#15803d]/50 transition-colors shrink-0">
                              {artist.avatar ? (
                                <AvatarImage src={artist.avatar} alt={artist.artisticName} />
                              ) : null}
                              <AvatarFallback className="text-base font-bebas text-[#4ade80] bg-[#16161a]">
                                {artist.artisticName.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h3 className="font-bebas text-lg text-white tracking-wide truncate group-hover:text-[#4ade80] transition-colors leading-none">
                                {artist.artisticName}
                              </h3>
                              <p className="text-xs text-[#71717a] mt-1 truncate">
                                {artist.realName || '—'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg bg-[#15803d]/15 text-[#4ade80] hover:bg-[#15803d]/30 border border-[#15803d]/30 transition-all active:scale-95"
                                title="Abrir WhatsApp"
                              >
                                <MessageCircle size={14} />
                              </a>
                            )}
                            <button
                              onClick={() => handleEdit(artist)}
                              className="btn-icon p-2 hover:text-white"
                              title="Editar"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(artist.id, artist.artisticName)}
                              className="btn-icon btn-icon-danger p-2"
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                          <Badge variant="gold" size="sm">{artist.genre}</Badge>
                          <Badge variant={statusColor[artist.status]} size="sm">{artist.status}</Badge>
                          {artistActiveTracks.length > 0 && (
                            <span className="text-[10px] font-semibold text-[#a1a1aa] bg-[#18181b] border border-[#27272a] px-2 py-0.5 rounded-full">
                              {artistActiveTracks.length} {artistActiveTracks.length === 1 ? 'música ativa' : 'músicas ativas'}
                            </span>
                          )}
                        </div>

                        {/* Bio */}
                        {artist.bio && (
                          <p className="text-xs text-[#a1a1aa] italic line-clamp-2 mt-3 bg-[#0d0d10] rounded-xl p-2.5 border border-[#1a1a1e]">
                            "{artist.bio}"
                          </p>
                        )}
                      </div>

                      {/* Stats & Socials */}
                      <div className="mt-4 pt-3.5 border-t border-[#1e1e22]">
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-[#0e0e11] rounded-lg px-2.5 py-2 text-center border border-white/[0.02]">
                            <span className="text-[9px] text-[#71717a] uppercase tracking-widest block">Projetos</span>
                            <span className="text-sm font-bebas text-white mt-0.5 block">{artist.projectCount}</span>
                          </div>
                          <div className="bg-[#0e0e11] rounded-lg px-2.5 py-2 text-center border border-white/[0.02]">
                            <span className="text-[9px] text-[#71717a] uppercase tracking-widest block">Faturamento</span>
                            <span className="text-sm font-bebas text-[#22c55e] mt-0.5 block">{fmt(artist.totalRevenue)}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-[#71717a]">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {artist.instagram && (
                              <a
                                href={`https://instagram.com/${artist.instagram.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#222226] text-[#71717a] hover:text-white transition-colors"
                              >
                                <Instagram size={12} />
                              </a>
                            )}
                            {artist.spotify && (
                              <a
                                href={artist.spotify.startsWith('http') ? artist.spotify : `https://open.spotify.com/search/${encodeURIComponent(artist.artisticName)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#222226] text-[#71717a] hover:text-[#1DB954] transition-colors"
                              >
                                <Play size={12} />
                              </a>
                            )}
                            {artist.youtube && (
                              <a
                                href={artist.youtube.startsWith('http') ? artist.youtube : `https://youtube.com/results?search_query=${encodeURIComponent(artist.artisticName)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#222226] text-[#71717a] hover:text-[#FF0000] transition-colors"
                              >
                                <Youtube size={12} />
                              </a>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDetail(artist)
                            }}
                            className="text-[11px] font-semibold text-[#22c55e] hover:text-[#4ade80] flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15803d]/15 hover:bg-[#15803d]/25 border border-[#15803d]/30 transition-all cursor-pointer active:scale-95 shadow-sm"
                          >
                            <span>Ver ficha</span>
                            <ArrowUpRight size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </>
        ) : (
          /* ═══════════════════════════════════════════════════════════
             VISÃO DO ARTISTA: Portal Pessoal do Artista
             ═══════════════════════════════════════════════════════════ */
          <div className="space-y-8">
            {/* Hero Profile Card */}
            {currentArtist && (
              <div className="p-6 rounded-2xl bg-[#111114] border border-[#222226] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
                <div className="flex items-center gap-4 min-w-0">
                  <Avatar className="h-16 w-16 border-2 border-[#15803d]/50 shrink-0">
                    {currentArtist.avatar ? (
                      <AvatarImage src={currentArtist.avatar} alt={currentArtist.artisticName} />
                    ) : null}
                    <AvatarFallback className="text-xl font-bebas text-[#4ade80] bg-[#16161a]">
                      {currentArtist.artisticName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-bebas text-2xl text-white tracking-wide truncate">
                        {currentArtist.artisticName}
                      </h2>
                      <Badge variant="green" size="sm">{currentArtist.status}</Badge>
                    </div>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      Gênero: <span className="uppercase text-[#22c55e] font-semibold">{currentArtist.genre}</span> • {currentArtist.phone ? formatPhone(currentArtist.phone) : 'Sem telefone cadastrado'}
                    </p>
                    {currentArtist.bio && (
                      <p className="text-xs text-[#71717a] italic mt-1 line-clamp-1">
                        "{currentArtist.bio}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <a
                    href="https://wa.me/5511999999999?text=Fala%20est%C3%BAdio%2C%20gostaria%20de%20marcar%20um%20novo%20hor%C3%A1rio%20de%20grava%C3%A7%C3%A3o!"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-xs transition-all shadow-sm active:scale-98"
                  >
                    <MessageCircle size={15} />
                    <span>Solicitar Horário</span>
                  </a>
                  <Link
                    href="/kanban"
                    className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-[#222226] border border-[#27272a] text-white font-semibold text-xs transition-all"
                  >
                    <Music size={15} />
                    <span>Ver no Kanban</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Grid: Minhas Músicas + Próximas Sessões */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Minhas Faixas em Produção */}
              <div className="p-6 rounded-2xl bg-[#0f0f11] border border-[#1e1e22] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e1e22]">
                  <div className="flex items-center gap-2">
                    <Music size={16} className="text-[#22c55e]" />
                    <h3 className="font-bebas text-xl text-white tracking-wide">
                      Minhas Músicas no Estúdio ({myTracks.length})
                    </h3>
                  </div>
                  <Link href="/kanban" className="text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1">
                    <span>Quadro</span>
                    <ArrowUpRight size={12} />
                  </Link>
                </div>

                {myTracks.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-[#222226] rounded-xl">
                    <Music size={24} className="text-[#444] mx-auto mb-2" />
                    <p className="text-xs text-[#71717a]">Você ainda não tem músicas em produção cadastradas.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myTracks.map((track) => (
                      <div
                        key={track.id}
                        className="p-4 rounded-xl bg-[#141417] border border-[#222226] space-y-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bebas text-base text-white tracking-wide truncate">
                            {track.trackName}
                          </h4>
                          <Badge
                            variant={
                              track.stage === 'entregue'
                                ? 'green'
                                : track.stage === 'recall'
                                ? 'crimson'
                                : track.stage === 'master'
                                ? 'purple'
                                : 'gold'
                            }
                            size="sm"
                          >
                            {STAGE_LABELS[track.stage]}
                          </Badge>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-[#71717a]">
                            <span>Andamento da faixa</span>
                            <span className="font-bold text-[#4ade80]">{STAGE_PROGRESS[track.stage]}%</span>
                          </div>
                          <Progress
                            value={STAGE_PROGRESS[track.stage]}
                            className="h-1.5 bg-[#1e1e22]"
                            indicatorClassName={track.stage === 'entregue' ? 'bg-emerald-400' : 'bg-[#22c55e]'}
                          />
                        </div>

                        <div className="pt-2 border-t border-[#1e1e22] flex items-center justify-between text-[11px] text-[#71717a]">
                          <span>{track.daysInStage === 0 ? 'Hoje no estágio' : `${track.daysInStage} dias no estágio`}</span>
                          {track.driveLink ? (
                            <a
                              href={track.driveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#4ade80] hover:underline"
                            >
                              <span>Acessar Guia / Drive</span>
                              <ExternalLink size={10} />
                            </a>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Minhas Próximas Sessões */}
              <div className="p-6 rounded-2xl bg-[#0f0f11] border border-[#1e1e22] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1e1e22]">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#22c55e]" />
                    <h3 className="font-bebas text-xl text-white tracking-wide">
                      Próximas Gravações & Shows ({mySessions.length})
                    </h3>
                  </div>
                  <Link href="/schedule" className="text-xs text-[#a1a1aa] hover:text-white flex items-center gap-1">
                    <span>Agenda</span>
                    <ArrowUpRight size={12} />
                  </Link>
                </div>

                {mySessions.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-[#222226] rounded-xl">
                    <Calendar size={24} className="text-[#444] mx-auto mb-2" />
                    <p className="text-xs text-[#71717a]">Nenhuma sessão agendada para os próximos dias.</p>
                    <a
                      href="https://wa.me/5511999999999?text=Fala%20est%C3%BAdio%2C%20gostaria%20de%20marcar%20um%20novo%20hor%C3%A1rio%20de%20grava%C3%A7%C3%A3o!"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-xs text-[#22c55e] hover:underline"
                    >
                      + Solicitar novo horário pelo WhatsApp
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mySessions.map((sess) => (
                      <div
                        key={sess.id}
                        className="p-4 rounded-xl bg-[#141417] border border-[#222226] flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs font-semibold text-white capitalize">
                            {format(new Date(sess.date + 'T12:00:00'), "EEEE, dd 'de' MMMM", { locale: ptBR })}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-[#71717a]">
                            <span className="flex items-center gap-1 text-[#d4d4d8]">
                              <Clock size={12} className="text-[#22c55e]" />
                              {sess.startTime} - {sess.endTime}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{sess.serviceType}</span>
                          </div>
                        </div>

                        <Badge variant={sess.status === 'confirmado' ? 'green' : 'gray'} size="sm">
                          {sess.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Modals & Sheets ─── */}
      {canEdit && (
        <>
          <ArtistModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            artist={selectedArtist}
            onSave={loadData}
          />
          <UsersModal
            isOpen={isUsersModalOpen}
            onClose={() => setIsUsersModalOpen(false)}
          />
        </>
      )}

      {/* Ficha Completa do Artista via Sheet */}
      <ArtistDetailSheet
        artist={detailArtist}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false)
          setDetailArtist(null)
        }}
        onEdit={(artist) => {
          setIsDetailOpen(false)
          handleEdit(artist)
        }}
        onDelete={(id, name) => {
          setIsDetailOpen(false)
          handleDelete(id, name)
        }}
        canEdit={canEdit}
        kanbanCards={kanbanCards}
        sessions={sessions}
      />
    </div>
  )
}
