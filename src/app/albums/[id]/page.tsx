"use client"

import React, { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Play,
  Pause,
  Plus,
  Edit2,
  Trash2,
  Disc3,
  Music,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react"
import PageWrapper from "@/components/ui/PageWrapper"
import { Album, AlbumTrack, TrackVersion } from "@/lib/types"
import { getAlbumsAsync, saveAlbumAsync, deleteAlbumAsync } from "@/lib/storage"
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"
import { AlbumTrackPicker } from "@/components/albums/AlbumTrackPicker"
import { AlbumCreateSheet } from "@/components/albums/AlbumCreateSheet"
import { VersionSelector } from "@/components/albums/VersionSelector"

interface AlbumDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [album, setAlbum] = useState<Album | null>(null)
  const [loading, setLoading] = useState(true)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const { playTrack, pauseTrack, resumeTrack, currentTrack, isPlaying, switchVersion, activeVersion } = useAudioPlayer()

  const loadAlbum = async () => {
    setLoading(true)
    try {
      const albums = await getAlbumsAsync()
      const found = albums.find((a) => a.id === id)
      if (found) {
        setAlbum(found)
      } else {
        router.push("/albums")
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes do álbum:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlbum()
  }, [id])

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

    playTrack(
      {
        id: track.kanbanCardId,
        title: track.trackName,
        artist: track.artistName || album?.artistName || "",
        versions: track.versions,
        activeVersionId: track.selectedVersionId,
      },
      track.selectedVersionId
    )
  }

  const handlePlayAll = () => {
    if (!album || !album.tracks || album.tracks.length === 0) return
    const first = album.tracks[0]
    playTrack(
      {
        id: first.kanbanCardId,
        title: first.trackName,
        artist: first.artistName || album.artistName,
        versions: first.versions,
        activeVersionId: first.selectedVersionId,
      },
      first.selectedVersionId
    )
  }

  const handleAddTracks = async (newTracks: AlbumTrack[]) => {
    if (!album) return
    const updatedTracks = [...album.tracks, ...newTracks].map((t, idx) => ({
      ...t,
      order: idx + 1,
    }))

    const updatedAlbum: Album = {
      ...album,
      tracks: updatedTracks,
      updatedAt: new Date().toISOString(),
    }

    setAlbum(updatedAlbum)
    await saveAlbumAsync(updatedAlbum)
  }

  const handleRemoveTrack = async (cardId: string) => {
    if (!album) return
    const updatedTracks = album.tracks
      .filter((t) => t.kanbanCardId !== cardId)
      .map((t, idx) => ({
        ...t,
        order: idx + 1,
      }))

    const updatedAlbum: Album = {
      ...album,
      tracks: updatedTracks,
      updatedAt: new Date().toISOString(),
    }

    setAlbum(updatedAlbum)
    await saveAlbumAsync(updatedAlbum)
  }

  const handleVersionChange = async (cardId: string, versionId: string) => {
    if (!album) return
    const updatedTracks = album.tracks.map((t) => {
      if (t.kanbanCardId === cardId) {
        return { ...t, selectedVersionId: versionId }
      }
      return t
    })

    const updatedAlbum: Album = {
      ...album,
      tracks: updatedTracks,
      updatedAt: new Date().toISOString(),
    }

    setAlbum(updatedAlbum)
    await saveAlbumAsync(updatedAlbum)

    // Se essa faixa estiver tocando agora, atualiza a versão no player instantaneamente (A/B)
    if (currentTrack?.id === cardId) {
      switchVersion(versionId)
    }
  }

  const handleDeleteAlbum = async () => {
    if (!album) return
    if (confirm(`Tem certeza que deseja excluir o álbum "${album.title}"?`)) {
      await deleteAlbumAsync(album.id)
      router.push("/albums")
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center min-h-[50vh] text-[#71717a] text-sm font-mono">
          Carregando álbum...
        </div>
      </PageWrapper>
    )
  }

  if (!album) return null

  return (
    <PageWrapper>
      <div className="space-y-8 max-w-6xl mx-auto pb-24">
        {/* Navigation & Actions Top */}
        <div className="flex items-center justify-between">
          <Link
            href="/albums"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] hover:text-white transition-colors bg-[#141416] hover:bg-[#1a1a1e] border border-[#27272a] px-3 py-1.5 rounded-xl cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Voltar para Álbuns</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#d4d4d8] hover:text-white bg-[#18181b] hover:bg-[#222226] border border-[#27272a] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Edit2 size={13} />
              <span>Editar</span>
            </button>
            <button
              onClick={handleDeleteAlbum}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Excluir</span>
            </button>
          </div>
        </div>

        {/* Hero Section — Untitled Style Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#18181c]/90 via-[#111114]/90 to-[#0c0c0e] border border-[#27272a] p-6 md:p-8 shadow-2xl">
          {/* Background Blurred Ambient Glow */}
          {album.coverUrl && (
            <div
              className="absolute inset-0 opacity-20 filter blur-3xl scale-110 pointer-events-none bg-cover bg-center"
              style={{ backgroundImage: `url(${album.coverUrl})` }}
            />
          )}

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
            {/* Cover Art */}
            <div className="relative w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden bg-[#18181b] border border-[#3f3f46]/40 shadow-2xl flex-shrink-0 group">
              {album.coverUrl ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#52525b]">
                  <Disc3 size={64} className="stroke-[1.5]" />
                </div>
              )}
            </div>

            {/* Album Metadata */}
            <div className="flex-1 text-center md:text-left min-w-0 space-y-3">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#22c55e]/10 text-[#4ade80] border border-[#22c55e]/20 font-bold">
                  Projeto / Álbum
                </span>
                {album.year && (
                  <span className="text-[11px] font-mono text-[#71717a]">
                    • {album.year}
                  </span>
                )}
              </div>

              <h1 className="font-bebas text-4xl md:text-6xl text-white tracking-wider leading-none truncate">
                {album.title}
              </h1>

              <p className="text-sm md:text-base text-[#a1a1aa] font-medium truncate">
                {album.artistName || "Artista não informado"}
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[#71717a] font-mono pt-1">
                <span>{album.tracks.length} {album.tracks.length === 1 ? "faixa" : "faixas"}</span>
                <span>•</span>
                <span>Untitled Stream Engine</span>
              </div>

              {/* Play All button */}
              <div className="pt-2 flex items-center justify-center md:justify-start gap-3">
                <button
                  onClick={handlePlayAll}
                  disabled={album.tracks.length === 0}
                  className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-black font-bold text-xs md:text-sm px-6 py-3 rounded-2xl transition-all shadow-lg shadow-[#22c55e]/20 active:scale-95 cursor-pointer"
                >
                  <Play size={16} className="fill-black" />
                  <span>Ouvir Álbum</span>
                </button>

                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="inline-flex items-center gap-2 bg-[#18181b] hover:bg-[#222226] text-white border border-[#27272a] font-semibold text-xs md:text-sm px-4 py-3 rounded-2xl transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={15} className="text-[#22c55e]" />
                  <span>Adicionar Faixa</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tracklist Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Music size={18} className="text-[#22c55e]" />
              <span>Tracklist & Versões</span>
            </h2>
            <span className="text-xs text-[#71717a] font-mono">
              Selecione a versão da mixagem para escuta
            </span>
          </div>

          {album.tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-[#27272a] bg-[#101012]">
              <Music size={32} className="text-[#3f3f46] mb-3" />
              <p className="text-sm font-medium text-white">Nenhuma faixa incluída neste álbum</p>
              <p className="text-xs text-[#71717a] mt-1 max-w-sm">
                Selecione faixas cadastradas no fluxo de produção Kanban para montar a tracklist oficial.
              </p>
              <button
                onClick={() => setIsPickerOpen(true)}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/20 px-3.5 py-2 rounded-xl hover:bg-[#22c55e]/20 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Escolher Faixas</span>
              </button>
            </div>
          ) : (
            <div className="bg-[#121214] border border-[#1e1e22] rounded-2xl overflow-hidden divide-y divide-[#1e1e22]">
              {album.tracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.kanbanCardId
                const trackPlaying = isCurrent && isPlaying
                const versions = track.versions || []
                const activeVer = versions.find(
                  (v) => v.id === (track.selectedVersionId || versions[versions.length - 1]?.id)
                )

                return (
                  <div
                    key={track.kanbanCardId}
                    className={`flex items-center gap-3 md:gap-4 p-3.5 md:px-5 md:py-4 transition-all group ${
                      isCurrent
                        ? "bg-[#22c55e]/5 border-l-4 border-l-[#22c55e]"
                        : "hover:bg-[#161619] border-l-4 border-l-transparent"
                    }`}
                  >
                    {/* Index or Play Button */}
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                          trackPlaying
                            ? "bg-[#22c55e] text-black"
                            : "bg-[#18181b] group-hover:bg-[#22c55e]/20 text-[#a1a1aa] group-hover:text-[#4ade80] border border-[#27272a]"
                        }`}
                        title={trackPlaying ? "Pausar" : "Tocar versão selecionada"}
                      >
                        {trackPlaying ? (
                          <Pause size={13} className="fill-black" />
                        ) : (
                          <Play size={13} className="fill-current ml-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Track Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#52525b] w-4">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <h3
                          className={`text-sm font-semibold truncate ${
                            isCurrent ? "text-[#4ade80]" : "text-[#f4f4f5]"
                          }`}
                        >
                          {track.trackName}
                        </h3>
                        {activeVer?.isFinal && (
                          <span className="text-[9px] font-bold text-[#22c55e] bg-[#22c55e]/15 border border-[#22c55e]/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                            Final
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#71717a] truncate ml-6 mt-0.5">
                        {track.artistName || album.artistName}
                      </p>
                    </div>

                    {/* Untitled-Style Version Selector */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <VersionSelector
                        versions={versions}
                        selectedVersionId={track.selectedVersionId}
                        onChange={(versionId) =>
                          handleVersionChange(track.kanbanCardId, versionId)
                        }
                      />
                    </div>

                    {/* Remove Action */}
                    <button
                      onClick={() => handleRemoveTrack(track.kanbanCardId)}
                      title="Remover faixa deste álbum"
                      className="opacity-0 group-hover:opacity-100 text-[#52525b] hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all flex-shrink-0 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Modals */}
        <AlbumTrackPicker
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          existingTrackIds={album.tracks.map((t) => t.kanbanCardId)}
          onAddTracks={handleAddTracks}
        />

        <AlbumCreateSheet
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          album={album}
          onSave={(updated) => setAlbum(updated)}
        />
      </div>
    </PageWrapper>
  )
}
