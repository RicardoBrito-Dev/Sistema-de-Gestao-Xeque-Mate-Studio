"use client"

import React, { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { AlbumTrack, TrackVersion } from "@/lib/types"
import { AudioDropzone } from "@/components/audio/AudioDropzone"
import { useAudioPlayer } from "@/contexts/AudioPlayerContext"
import { deleteAudioBlob } from "@/lib/audioStorage"
import { getKanbanCardsAsync, saveKanbanCardAsync } from "@/lib/storage"
import { Play, Star, Trash2, Layers, Check, Music2 } from "lucide-react"

interface TrackVersionsModalProps {
  isOpen: boolean
  onClose: () => void
  track: AlbumTrack | null
  onSaveVersions: (updatedVersions: TrackVersion[], activeVersionId?: string) => void
}

export function TrackVersionsModal({
  isOpen,
  onClose,
  track,
  onSaveVersions,
}: TrackVersionsModalProps) {
  const [versions, setVersions] = useState<TrackVersion[]>([])
  const [activeVersionId, setActiveVersionId] = useState<string | undefined>(undefined)
  const { playTrack } = useAudioPlayer()

  useEffect(() => {
    if (track) {
      setVersions(track.versions || [])
      setActiveVersionId(track.selectedVersionId || track.versions?.[track.versions.length - 1]?.id)
    }
  }, [track, isOpen])

  if (!track) return null

  const handleVersionAdded = async (newVer: TrackVersion) => {
    const updated = [...versions, newVer]
    setVersions(updated)
    setActiveVersionId(newVer.id)

    // Atualiza o card do Kanban em background
    syncWithKanban(updated, newVer.id)
    onSaveVersions(updated, newVer.id)
  }

  const handleMarkFinal = (versionId: string) => {
    const updated = versions.map((v) => ({
      ...v,
      isFinal: v.id === versionId,
    }))
    setVersions(updated)
    setActiveVersionId(versionId)

    syncWithKanban(updated, versionId)
    onSaveVersions(updated, versionId)
  }

  const handleDeleteVersion = async (versionId: string) => {
    await deleteAudioBlob(versionId)
    const updated = versions.filter((v) => v.id !== versionId)
    let nextActive = activeVersionId
    if (activeVersionId === versionId) {
      nextActive = updated.length > 0 ? updated[updated.length - 1].id : undefined
      setActiveVersionId(nextActive)
    }
    setVersions(updated)

    syncWithKanban(updated, nextActive)
    onSaveVersions(updated, nextActive)
  }

  const handlePlayVersion = (version: TrackVersion) => {
    playTrack(
      {
        id: track.kanbanCardId,
        title: track.trackName,
        artist: track.artistName,
        versions,
        activeVersionId: version.id,
      },
      version.id
    )
  }

  const syncWithKanban = async (updatedVersions: TrackVersion[], activeId?: string) => {
    try {
      const cards = await getKanbanCardsAsync()
      const card = cards.find((c) => c.id === track.kanbanCardId)
      if (card) {
        await saveKanbanCardAsync({
          ...card,
          versions: updatedVersions,
          activeVersionId: activeId,
        })
      }
    } catch (err) {
      console.warn("Erro ao sincronizar versão com Kanban:", err)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <div className="flex items-center gap-2 text-[#22c55e]">
            <Layers size={18} />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">
              Controle de Mixagens
            </span>
          </div>
          <SheetTitle className="text-xl leading-tight mt-1">
            {track.trackName}
          </SheetTitle>
          <SheetDescription>
            Envie novas versões de áudio (MP3/WAV), alterne a versão ativa e marque a versão final da faixa.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-5 my-4 pr-1">
          {/* Dropzone para nova versão */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider block">
              Subir Nova Versão (v{versions.length + 1})
            </span>
            <AudioDropzone
              existingVersions={versions}
              onVersionAdded={handleVersionAdded}
              className="h-28"
            />
          </div>

          {/* Histórico de versões */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wider">
                Versões Disponíveis ({versions.length})
              </span>
              <span className="text-[10px] text-[#71717a] font-mono">
                Untitled A/B Switch
              </span>
            </div>

            {versions.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#27272a] text-center bg-[#121214]">
                <p className="text-xs text-[#71717a]">
                  Nenhum áudio enviado ainda para esta faixa.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {versions.map((v) => {
                  const isActive = activeVersionId === v.id
                  return (
                    <li
                      key={v.id}
                      className={`flex items-center gap-2 rounded-xl p-2.5 border transition-all ${
                        v.isFinal
                          ? "border-[#22c55e]/40 bg-[#22c55e]/8"
                          : isActive
                          ? "border-[#27272a] bg-[#1a1a1d]"
                          : "border-transparent bg-[#141416] hover:bg-[#1a1a1d]"
                      }`}
                    >
                      {/* Play Version */}
                      <button
                        type="button"
                        onClick={() => handlePlayVersion(v)}
                        className="flex-shrink-0 h-8 w-8 rounded-full bg-[#22c55e]/15 hover:bg-[#22c55e]/30 text-[#4ade80] flex items-center justify-center transition-all active:scale-90 cursor-pointer"
                        title="Ouvir esta versão"
                      >
                        <Play size={11} className="fill-[#4ade80] ml-0.5" />
                      </button>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#e4e4e7] truncate flex items-center gap-1.5">
                          {v.name}
                          {v.isFinal && (
                            <span className="text-[9px] font-bold text-[#22c55e] bg-[#22c55e]/15 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                              Final
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-[#52525b] truncate font-mono mt-0.5">
                          {v.fileName} {v.fileSize ? `· ${v.fileSize}` : ""}
                        </p>
                      </div>

                      {/* Marcar Versão Final */}
                      <button
                        type="button"
                        onClick={() => handleMarkFinal(v.id)}
                        title={v.isFinal ? "Versão final aprovada" : "Marcar como versão final"}
                        className={`flex-shrink-0 h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                          v.isFinal
                            ? "text-[#facc15] bg-[#facc15]/15"
                            : "text-[#3f3f46] hover:text-[#facc15] hover:bg-[#facc15]/10"
                        }`}
                      >
                        <Star size={12} className={v.isFinal ? "fill-[#facc15]" : ""} />
                      </button>

                      {/* Deletar Versão */}
                      <button
                        type="button"
                        onClick={() => handleDeleteVersion(v.id)}
                        title="Excluir versão"
                        className="flex-shrink-0 h-7 w-7 rounded-lg text-[#3f3f46] hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <SheetFooter className="px-0">
          <button type="button" onClick={onClose} className="btn-primary w-full">
            Concluir
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
