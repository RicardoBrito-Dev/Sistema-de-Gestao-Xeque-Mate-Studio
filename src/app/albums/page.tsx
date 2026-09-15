"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Disc3, Plus, Music, Play, Layers, Calendar, User } from "lucide-react"
import PageWrapper from "@/components/ui/PageWrapper"
import { Album } from "@/lib/types"
import { getAlbums, getAlbumsAsync } from "@/lib/storage"
import { AlbumCreateSheet } from "@/components/albums/AlbumCreateSheet"
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const { playTrack } = useAudioPlayer()

  const loadAlbums = async () => {
    // 1. Carrega do cache local imediatamente para não piscar
    const cached = getAlbums()
    if (cached.length > 0) {
      setAlbums(cached)
      setLoading(false)
    }

    // 2. Sincroniza em background com Supabase
    try {
      const data = await getAlbumsAsync()
      if (data && data.length > 0) {
        setAlbums(data)
      }
    } catch (err) {
      console.error("Erro ao carregar álbuns:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAlbums()
  }, [])

  const handlePlayAlbum = (e: React.MouseEvent, album: Album) => {
    e.preventDefault()
    e.stopPropagation()
    if (!album.tracks || album.tracks.length === 0) return

    const playlist = album.tracks.map((t) => ({
      id: t.kanbanCardId,
      title: t.trackName,
      artist: t.artistName || album.artistName,
      versions: t.versions,
      activeVersionId: t.selectedVersionId,
    }))

    const firstTrack = album.tracks[0]
    playTrack(
      playlist[0],
      firstTrack.selectedVersionId,
      playlist
    )
  }

  return (
    <PageWrapper>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e1e22] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-[11px] font-mono text-[#71717a] uppercase tracking-widest">
                Catálogo de Projetos
              </span>
            </div>
            <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider mt-1 flex items-center gap-3">
              <Disc3 className="text-[#22c55e]" size={32} />
              Álbuns & EPs
            </h1>
            <p className="text-xs md:text-sm text-[#71717a] mt-0.5">
              Organize faixas em projetos completos, defina capas e compare versões de mixagem no estilo Untitled.
            </p>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs md:text-sm px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-[#22c55e]/10 active:scale-95"
          >
            <Plus size={16} />
            <span>Novo Álbum</span>
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-[#141416] border border-[#222226]" />
            ))}
          </div>
        ) : albums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-[#27272a] bg-[#0c0c0e]/60">
            <div className="h-16 w-16 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-[#52525b] mb-4">
              <Disc3 size={32} />
            </div>
            <h3 className="text-lg font-semibold text-white">Nenhum álbum criado ainda</h3>
            <p className="text-xs md:text-sm text-[#71717a] max-w-sm mt-1 mb-6">
              Crie seu primeiro álbum ou EP para agrupar faixas do estúdio e escutar as versões A/B.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Criar Primeiro Álbum</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {albums.map((album) => {
              const trackCount = album.tracks?.length || 0
              return (
                <Link
                  key={album.id}
                  href={`/albums/${album.id}`}
                  className="group flex flex-col bg-[#121214] hover:bg-[#161619] border border-[#222226] hover:border-[#15803d]/40 rounded-2xl p-3 transition-all duration-300 hover:shadow-xl hover:shadow-[#000]/60 relative overflow-hidden"
                >
                  {/* Capa */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#18181b] border border-[#27272a]/60 flex items-center justify-center group-hover:shadow-lg transition-all">
                    {album.coverUrl ? (
                      <img
                        src={album.coverUrl}
                        alt={album.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-[#3f3f46]">
                        <Disc3 size={40} className="stroke-[1.5]" />
                      </div>
                    )}

                    {/* Quick Play Overlay */}
                    {trackCount > 0 && (
                      <button
                        type="button"
                        onClick={(e) => handlePlayAlbum(e, album)}
                        title="Tocar álbum"
                        className="absolute bottom-2.5 right-2.5 h-10 w-10 rounded-full bg-[#22c55e] text-black flex items-center justify-center shadow-lg shadow-black/80 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:scale-110 active:scale-95"
                      >
                        <Play size={16} className="fill-black ml-0.5" />
                      </button>
                    )}

                    {/* Track count badge */}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-mono text-[#a1a1aa] flex items-center gap-1">
                      <Music size={10} />
                      <span>{trackCount}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="mt-3 min-w-0">
                    <h3 className="text-sm font-semibold text-[#f4f4f5] truncate group-hover:text-[#4ade80] transition-colors">
                      {album.title}
                    </h3>
                    <p className="text-xs text-[#71717a] truncate mt-0.5">
                      {album.artistName || "Vários Artistas"}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-[#52525b] font-mono">
                      {album.year && <span>{album.year}</span>}
                      {album.year && <span>•</span>}
                      <span>{trackCount} {trackCount === 1 ? "faixa" : "faixas"}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Modal / Sheet Criação */}
        <AlbumCreateSheet
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={(newAlbum) => {
            setAlbums((prev) => {
              const filtered = prev.filter((a) => a.id !== newAlbum.id)
              return [newAlbum, ...filtered]
            })
          }}
        />
      </div>
    </PageWrapper>
  )
}
