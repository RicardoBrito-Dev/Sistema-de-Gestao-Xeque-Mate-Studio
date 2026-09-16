"use client"

import React, { useState, useEffect, use, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Play,
  Pause,
  Disc3,
  Music,
  Clock,
  Headphones,
  Share2,
  Check,
  Volume2,
} from "lucide-react"
import { Album, AlbumTrack, TrackVersion } from "@/lib/types"
import { getAlbumByIdAsync } from "@/lib/storage"
import { useAudioPlayer, PlayingTrack } from "@/contexts/AudioPlayerContext"

interface SharePageProps {
  params: Promise<{ id: string }>
}

export default function SharePage({ params }: SharePageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
          <div className="w-6 h-6 border-2 border-[#22c55e] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ShareContent params={params} />
    </Suspense>
  )
}

function ShareContent({ params }: SharePageProps) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const targetTrackId = searchParams.get("track")

  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<Record<string, string>>({})

  const {
    playTrack,
    pauseTrack,
    resumeTrack,
    currentTrack,
    isPlaying,
  } = useAudioPlayer()

  // Carrega os dados do álbum
  useEffect(() => {
    let isMounted = true
    async function fetchAlbum() {
      try {
        const data = await getAlbumByIdAsync(id)
        if (isMounted) {
          setAlbum(data)
          if (data) {
            // Inicializa as versões selecionadas para cada faixa
            const initialVersions: Record<string, string> = {}
            data.tracks.forEach((t) => {
              const versions = t.versions || []
              initialVersions[t.kanbanCardId] =
                t.selectedVersionId || (versions.length > 0 ? versions[versions.length - 1].id : "")
            })
            setSelectedVersions(initialVersions)
          }
        }
      } catch (err) {
        console.error("Erro ao carregar álbum compartilhado:", err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAlbum()
    return () => {
      isMounted = false
    }
  }, [id])

  // Sincroniza contagem de reproduções em tempo real
  useEffect(() => {
    const handlePlayCountUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        trackId: string
        versionId?: string
        playCount: number
        versionPlayCount?: number
      }>
      const { trackId, versionId, playCount, versionPlayCount } = customEvent.detail
      if (!playCount) return

      setAlbum((prev) => {
        if (!prev) return prev
        const updatedTracks = prev.tracks.map((t) => {
          if (t.kanbanCardId === trackId || (t as unknown as { id?: string }).id === trackId) {
            const updatedVersions = t.versions?.map((v) => {
              if (versionId && v.id === versionId && versionPlayCount !== undefined) {
                return { ...v, playCount: versionPlayCount }
              }
              return v
            })
            return {
              ...t,
              playCount,
              versions: updatedVersions || t.versions,
            }
          }
          return t
        })
        return { ...prev, tracks: updatedTracks }
      })
    }

    window.addEventListener("xm:play-count-updated", handlePlayCountUpdate)
    return () => window.removeEventListener("xm:play-count-updated", handlePlayCountUpdate)
  }, [])

  // Função para montar a PlayingTrack a partir do AlbumTrack
  const createPlayingTrack = (track: AlbumTrack, specificVersionId?: string): PlayingTrack => {
    const versions = track.versions || []
    const versionIdToUse =
      specificVersionId ||
      selectedVersions[track.kanbanCardId] ||
      track.selectedVersionId ||
      (versions.length > 0 ? versions[versions.length - 1].id : undefined)

    return {
      id: track.kanbanCardId,
      title: track.trackName,
      artist: track.artistName || album?.artistName || "Artista",
      albumId: album?.id,
      activeVersionId: versionIdToUse,
      versions: versions,
      playCount: track.playCount,
    }
  }

  // Tocar uma faixa específica
  const handlePlayTrack = (track: AlbumTrack) => {
    const isCurrent = currentTrack?.id === track.kanbanCardId
    if (isCurrent) {
      if (isPlaying) {
        pauseTrack()
      } else {
        resumeTrack()
      }
      return
    }

    const versionToPlay = selectedVersions[track.kanbanCardId] || track.selectedVersionId
    const playingTrack = createPlayingTrack(track, versionToPlay)
    const playlist = (album?.tracks || []).map((t) => createPlayingTrack(t))
    playTrack(playingTrack, versionToPlay, playlist)
  }

  // Tocar o álbum completo do início
  const handlePlayAll = () => {
    if (!album || album.tracks.length === 0) return
    const playlist = album.tracks.map((t) => createPlayingTrack(t))

    // Se houver faixa compartilhada especificada na URL, começa por ela
    const startIndex = targetTrackId
      ? album.tracks.findIndex((t) => t.kanbanCardId === targetTrackId)
      : 0

    const targetTrack = album.tracks[startIndex !== -1 ? startIndex : 0]
    const initialTrack = playlist[startIndex !== -1 ? startIndex : 0]
    const versionToPlay = selectedVersions[targetTrack.kanbanCardId] || targetTrack.selectedVersionId
    playTrack(initialTrack, versionToPlay, playlist)
  }

  // Copiar link de compartilhamento
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : ""
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${album?.title || "Música"} — Xeque Mate Studio`,
          text: `Ouça "${album?.title}" por ${album?.artistName} no player oficial do Xeque Mate Studio:`,
          url,
        })
        return
      } catch {
        // Ignora se o usuário cancelou o menu nativo
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] text-[#71717a] gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#121214] border border-[#27272a] flex items-center justify-center shadow-xl">
          <Disc3 size={24} className="text-[#22c55e] animate-spin" />
        </div>
        <p className="text-xs font-mono tracking-widest uppercase text-[#a1a1aa]">Carregando áudio...</p>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#09090b] px-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#161619] border border-[#27272a] flex items-center justify-center mb-4 text-[#71717a]">
          <Music size={32} />
        </div>
        <h1 className="font-bebas text-3xl text-white tracking-wide">Álbum ou Música Não Encontrada</h1>
        <p className="text-sm text-[#71717a] max-w-md mt-2">
          Este link pode estar indisponível ou ter sido removido pelo estúdio.
        </p>
      </div>
    )
  }

  const isAlbumPlaying = isPlaying && currentTrack?.albumId === album.id
  const totalPlays = album.tracks.reduce((sum, t) => sum + (t.playCount || 0), 0)

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col selection:bg-[#22c55e]/30">
      {/* Toast Feedback */}
      {copied && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-[#166534] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-[#22c55e]/50 animate-in fade-in duration-200">
          <Check size={14} className="text-[#4ade80]" />
          <span>Link copiado para a área de transferência!</span>
        </div>
      )}

      {/* Top Header Oficial */}
      <header className="w-full border-b border-[#18181b] bg-[#0c0c0e]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#141417] border border-[#27272a] flex items-center justify-center shadow-inner">
              <span className="text-[#22c55e] font-bebas text-lg tracking-wider">XM</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bebas text-base sm:text-lg text-white tracking-wider leading-none">
                  XEQUE MATE STUDIO
                </span>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20 px-1.5 py-0.5 rounded">
                  Player Oficial
                </span>
              </div>
              <p className="text-[10px] text-[#71717a] font-mono leading-none mt-0.5">
                Audição Externa • Alta Fidelidade
              </p>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 bg-[#18181b] hover:bg-[#222226] text-white border border-[#27272a] hover:border-[#3f3f46] text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer active:scale-95 shadow-sm"
            title="Compartilhar este link"
          >
            {copied ? <Check size={14} className="text-[#22c55e]" /> : <Share2 size={14} />}
            <span className="hidden sm:inline">{copied ? "Copiado!" : "Compartilhar"}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-36 space-y-8 sm:space-y-10">
        {/* Album Hero Showcase */}
        <div className="relative rounded-3xl bg-gradient-to-b from-[#16161a] to-[#0e0e11] border border-[#222226] p-6 sm:p-8 overflow-hidden shadow-2xl">
          {/* Subtle Ambient Glow */}
          {album.coverUrl && (
            <div
              className="absolute inset-0 opacity-20 filter blur-3xl scale-110 pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${album.coverUrl})` }}
            />
          )}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#22c55e]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#15803d]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 sm:gap-8">
            {/* Album Cover & Vinyl Combo */}
            <div className="relative group shrink-0">
              {/* Disc Peeking Behind Cover */}
              <div
                className={`absolute -right-4 sm:-right-6 top-1/2 -translate-y-1/2 h-36 w-36 sm:h-44 sm:w-44 rounded-full bg-[#101012] border-4 border-[#1f1f24] shadow-2xl flex items-center justify-center transition-transform duration-700 pointer-events-none ${
                  isAlbumPlaying ? "translate-x-4 sm:translate-x-6 rotate-180" : "group-hover:translate-x-3"
                }`}
              >
                <Disc3
                  size={42}
                  className={`text-[#22c55e] ${isAlbumPlaying ? "animate-spin" : ""}`}
                  style={{ animationDuration: "2.8s" }}
                />
              </div>

              {/* Cover Artwork Card */}
              <div className="relative h-44 w-44 sm:h-52 sm:w-52 rounded-2xl overflow-hidden bg-[#121214] border border-[#27272a] shadow-2xl z-10 flex items-center justify-center">
                {album.coverUrl ? (
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#3f3f46]">
                    <Disc3 size={56} className="text-[#27272a]" />
                    <span className="font-bebas text-lg text-[#52525b] mt-2">XEQUE MATE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Album Info & Primary Actions */}
            <div className="flex-1 text-center md:text-left min-w-0 space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/30 font-bold">
                  Álbum Oficial
                </span>
                {album.year && (
                  <span className="text-xs font-mono text-[#71717a]">
                    • {album.year}
                  </span>
                )}
              </div>

              <h1 className="font-bebas text-3xl sm:text-5xl md:text-6xl text-white tracking-wide leading-none truncate">
                {album.title}
              </h1>

              <p className="text-base sm:text-lg text-[#a1a1aa] font-medium truncate">
                {album.artistName || "Artista Independente"}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-5 text-xs text-[#71717a] font-mono pt-1">
                <span>{album.tracks.length} {album.tracks.length === 1 ? "faixa" : "faixas"}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1.5 text-[#4ade80]" title="Total de audições">
                  <Headphones size={13} className="text-[#22c55e]" />
                  <span>{totalPlays} {totalPlays === 1 ? "audição" : "audições"}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline text-[#52525b]">Masterização Xeque Mate</span>
              </div>

              {/* Action: Play All */}
              <div className="pt-3 flex flex-wrap items-center justify-center md:justify-start gap-3">
                <button
                  onClick={handlePlayAll}
                  disabled={album.tracks.length === 0}
                  className="inline-flex items-center gap-2.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold text-sm px-6 py-3 rounded-2xl transition-all shadow-xl shadow-[#22c55e]/25 active:scale-95 cursor-pointer"
                >
                  <Play size={16} className="fill-black" />
                  <span>{targetTrackId ? "Ouvir Faixa Compartilhada" : "Ouvir Álbum Completo"}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="h-11 w-11 flex items-center justify-center bg-[#18181b] hover:bg-[#222226] text-[#38bdf8] hover:text-[#7dd3fc] border border-[#27272a] hover:border-[#38bdf8]/50 rounded-2xl transition-all active:scale-90 cursor-pointer shadow-sm shrink-0"
                  title="Compartilhar link do álbum"
                >
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tracklist Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Music size={18} className="text-[#22c55e]" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Faixas do Álbum
              </h2>
            </div>
            <span className="text-xs text-[#71717a] font-mono hidden sm:inline">
              Áudio de alta fidelidade
            </span>
          </div>

          {/* Track Rows */}
          <div className="bg-[#121214] border border-[#1e1e22] rounded-2xl overflow-hidden divide-y divide-[#1e1e22] shadow-xl">
            {album.tracks.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#71717a]">
                Nenhuma faixa cadastrada neste projeto.
              </div>
            ) : (
              album.tracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.kanbanCardId
                const isTrackPlaying = isCurrent && isPlaying
                const isTargetSharedTrack = targetTrackId === track.kanbanCardId

                return (
                  <div
                    key={track.kanbanCardId}
                    className={`flex items-center justify-between gap-3 p-3 sm:px-5 sm:py-4 transition-all ${
                      isTargetSharedTrack
                        ? "bg-[#22c55e]/10 border-l-4 border-l-[#22c55e]"
                        : isCurrent
                        ? "bg-white/[0.03] border-l-4 border-l-[#22c55e]"
                        : "hover:bg-white/[0.02] border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Left: Index, Play Button, Track Title & Artist */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Number */}
                      <span className="text-xs font-mono text-[#52525b] w-5 text-center shrink-0 select-none">
                        {String(idx + 1).padStart(2, "0")}
                      </span>

                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                          isTrackPlaying
                            ? "bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/25"
                            : "bg-[#18181b] hover:bg-[#22c55e]/20 text-[#a1a1aa] hover:text-[#4ade80] border border-[#27272a]"
                        }`}
                        title={isTrackPlaying ? "Pausar" : "Tocar faixa"}
                      >
                        {isTrackPlaying ? (
                          <Pause size={14} className="fill-black" />
                        ) : (
                          <Play size={14} className="fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Title & Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3
                            className={`text-sm sm:text-base font-semibold truncate leading-tight ${
                              isCurrent ? "text-[#4ade80]" : "text-white"
                            }`}
                          >
                            {track.trackName}
                          </h3>

                          {isTargetSharedTrack && (
                            <span className="text-[9px] font-mono uppercase bg-[#22c55e]/20 text-[#4ade80] border border-[#22c55e]/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                              Compartilhada
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#71717a] mt-0.5 font-mono">
                          <span className="truncate">{track.artistName || album.artistName}</span>
                          <span>•</span>
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-[#a1a1aa]"
                            title="Total de audições desta faixa"
                          >
                            <Headphones size={10} className="text-[#22c55e]" />
                            <span>{track.playCount || 0}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Equalizer animation when playing */}
                    <div className="flex items-center gap-2 shrink-0">
                      {isTrackPlaying && (
                        <div className="flex items-end gap-0.5 h-3.5 px-2">
                          <span className="w-0.5 bg-[#22c55e] h-3.5 animate-pulse rounded-full"></span>
                          <span className="w-0.5 bg-[#22c55e] h-2 animate-bounce rounded-full" style={{ animationDelay: "120ms" }}></span>
                          <span className="w-0.5 bg-[#22c55e] h-3 animate-pulse rounded-full" style={{ animationDelay: "240ms" }}></span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Studio Branding Footer */}
        <footer className="pt-8 border-t border-[#18181b] text-center space-y-2">
          <p className="text-xs text-[#71717a] font-mono">
            Xeque Mate Studio — Engenharia de Áudio & Produção Musical
          </p>
          <p className="text-[10px] text-[#52525b]">
            Reproduzido com tecnologia de alta fidelidade sem perdas • Todos os direitos reservados
          </p>
        </footer>
      </main>
    </div>
  )
}
