"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { KanbanCard, AlbumTrack, TrackVersion } from "@/lib/types"
import { getKanbanCardsAsync, generateId } from "@/lib/storage"
import { uploadTrackVersion } from "@/lib/supabaseStorage"
import { saveAudioBlob } from "@/lib/audioStorage"
import {
  Search,
  Music2,
  CheckSquare,
  Square,
  Layers,
  PlusCircle,
  Kanban,
  UploadCloud,
  FileAudio,
  X,
  Loader2,
  Check,
} from "lucide-react"

interface AlbumTrackPickerProps {
  isOpen: boolean
  onClose: () => void
  existingTrackIds: string[]
  onAddTracks: (tracks: AlbumTrack[]) => void
  defaultArtistName?: string
}

export function AlbumTrackPicker({
  isOpen,
  onClose,
  existingTrackIds,
  onAddTracks,
  defaultArtistName = "",
}: AlbumTrackPickerProps) {
  // Tabs: 'kanban' = selecionar do estúdio, 'custom' = nova música avulsa
  const [tab, setTab] = useState<'kanban' | 'custom'>('kanban')

  // Kanban mode state
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  // Custom track mode state
  const [customTitle, setCustomTitle] = useState("")
  const [customArtist, setCustomArtist] = useState(defaultArtistName)
  const [customFile, setCustomFile] = useState<File | null>(null)
  const [customAudioUrl, setCustomAudioUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setSelected(new Set())
      setSearch("")
      setCustomTitle("")
      setCustomArtist(defaultArtistName)
      setCustomFile(null)
      setCustomAudioUrl(null)
      setIsUploading(false)

      getKanbanCardsAsync().then((data) => {
        setCards(data)
        setLoading(false)
      })
    }
  }, [isOpen, defaultArtistName])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  // Kanban Filter
  const filtered = cards.filter((c) => {
    if (existingTrackIds.includes(c.id)) return false
    const q = search.toLowerCase()
    return (
      c.trackName.toLowerCase().includes(q) ||
      c.artistName.toLowerCase().includes(q)
    )
  })

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleConfirmKanban = () => {
    const startOrder = existingTrackIds.length
    const newTracks: AlbumTrack[] = cards
      .filter((c) => selected.has(c.id))
      .map((c, i) => ({
        kanbanCardId: c.id,
        trackName: c.trackName,
        artistName: c.artistName,
        order: startOrder + i + 1,
        selectedVersionId: c.activeVersionId,
        versions: c.versions,
        feedbacks: [],
      }))
    onAddTracks(newTracks)
    onClose()
  }

  // Custom Track Audio Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("audio/") && !file.name.match(/\.(mp3|wav|m4a|ogg|flac|aac)$/i)) {
      alert("Por favor, selecione um arquivo de áudio válido (.mp3, .wav, .m4a, etc).")
      return
    }

    setCustomFile(file)
    // Se o título ainda não foi digitado, preenche automaticamente com o nome do arquivo
    if (!customTitle.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, "")
      setCustomTitle(cleanName)
    }
  }

  const handleConfirmCustom = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customTitle.trim()) {
      alert("Por favor, informe o nome da música.")
      return
    }

    setIsUploading(true)
    try {
      const trackId = `ext-${generateId()}`
      const versionId = `v-${generateId()}`
      let audioUrl = ""

      if (customFile) {
        // 1. Upload para Supabase Storage
        const remoteUrl = await uploadTrackVersion(customFile, versionId)
        if (remoteUrl) {
          audioUrl = remoteUrl
        } else {
          // Fallback: blob local + IndexedDB
          audioUrl = URL.createObjectURL(customFile)
          await saveAudioBlob(versionId, customFile)
        }
      }

      const initialVersion: TrackVersion = {
        id: versionId,
        versionNumber: 1,
        name: customFile ? "v1 • Áudio Inicial" : "v1 • Guia Inicial",
        audioUrl: audioUrl || "",
        fileName: customFile ? customFile.name : "sem_audio.mp3",
        fileSize: customFile ? formatFileSize(customFile.size) : undefined,
        uploadedAt: new Date().toISOString(),
      }

      const newTrack: AlbumTrack = {
        kanbanCardId: trackId,
        trackName: customTitle.trim(),
        artistName: customArtist.trim() || defaultArtistName || "Artista",
        order: existingTrackIds.length + 1,
        selectedVersionId: versionId,
        versions: [initialVersion],
        feedbacks: [],
      }

      onAddTracks([newTrack])
      onClose()
    } catch (err) {
      console.error("Erro ao adicionar faixa externa:", err)
      alert("Ocorreu um erro ao processar o áudio da faixa.")
    } finally {
      setIsUploading(false)
    }
  }

  const stageLabel: Record<string, string> = {
    gravacao: 'Gravação',
    mix: 'Mix',
    master: 'Master',
    recall: 'Recall',
    entregue: 'Entregue',
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-6 bg-[#0e0e11] border-l border-[#222226]">
        <SheetHeader className="text-left space-y-1">
          <SheetTitle className="text-lg font-bold text-white">Adicionar Faixas</SheetTitle>
          <SheetDescription className="text-xs text-[#71717a]">
            Adicione músicas do seu estúdio ou crie uma faixa nova avulsa
          </SheetDescription>
        </SheetHeader>

        {/* ── Segmented Control Tabs ── */}
        <div className="grid grid-cols-2 p-1 bg-[#141418] border border-[#222228] rounded-xl mt-4">
          <button
            type="button"
            onClick={() => setTab('kanban')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'kanban'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Kanban size={14} />
            <span>Do Estúdio (Kanban)</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('custom')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              tab === 'custom'
                ? 'bg-[#22c55e] text-black shadow-md'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <PlusCircle size={14} />
            <span>Música Nova (Avulsa)</span>
          </button>
        </div>

        {/* ── Tab 1: Selecionar do Kanban ── */}
        {tab === 'kanban' && (
          <div className="flex flex-col flex-1 min-h-0 mt-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
              <input
                type="text"
                placeholder="Buscar por faixa ou artista..."
                className="input-dark pl-8 w-full text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-0.5">
              {loading ? (
                <div className="flex items-center justify-center py-12 text-[#52525b] text-xs">
                  <Loader2 size={18} className="animate-spin mr-2 text-[#22c55e]" />
                  Carregando faixas do estúdio...
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-[#52525b] text-center px-4">
                  <Music2 size={28} className="stroke-[1.5]" />
                  <p className="text-xs font-medium">
                    {search ? "Nenhuma faixa encontrada" : "Todas as faixas do Kanban já estão no álbum"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setTab('custom')}
                    className="text-xs text-[#22c55e] hover:underline font-semibold mt-1"
                  >
                    + Criar uma música avulsa
                  </button>
                </div>
              ) : (
                filtered.map((card) => {
                  const isSelected = selected.has(card.id)
                  return (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => toggleSelect(card.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#22c55e]/40 bg-[#22c55e]/10'
                          : 'border-[#1e1e24] bg-[#141417] hover:bg-[#19191d]'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-[#22c55e] flex-shrink-0" />
                      ) : (
                        <Square size={16} className="text-[#3f3f46] flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#e4e4e7] truncate">{card.trackName}</p>
                        <p className="text-[10px] text-[#71717a] truncate mt-0.5">{card.artistName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {card.versions && card.versions.length > 0 && (
                          <span className="flex items-center gap-0.5 text-[9px] text-[#4ade80] bg-[#22c55e]/10 border border-[#22c55e]/20 px-1.5 py-0.5 rounded font-mono">
                            <Layers size={9} />
                            {card.versions.length}v
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-[#71717a] bg-[#1a1a1e] border border-[#272730] px-1.5 py-0.5 rounded">
                          {stageLabel[card.stage] || card.stage}
                        </span>
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            <SheetFooter className="px-0 mt-4 pt-3 border-t border-[#1e1e24]">
              <button type="button" onClick={onClose} className="btn-secondary text-xs">
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmKanban}
                disabled={selected.size === 0}
                className="btn-primary text-xs disabled:opacity-50"
              >
                Adicionar {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
            </SheetFooter>
          </div>
        )}

        {/* ── Tab 2: Nova Música Avulsa / Externa ── */}
        {tab === 'custom' && (
          <form onSubmit={handleConfirmCustom} className="flex flex-col flex-1 min-h-0 mt-4 space-y-4">
            <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
              {/* Nome da Música */}
              <div>
                <label className="label-field text-xs text-[#a1a1aa] block mb-1">
                  Nome da Música *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 01. Intro - O Começo de Tudo"
                  className="input-dark w-full text-xs"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>

              {/* Artista / Participações */}
              <div>
                <label className="label-field text-xs text-[#a1a1aa] block mb-1">
                  Artista / Participações
                </label>
                <input
                  type="text"
                  placeholder="Ex: Rick Beatz feat. MC Dog"
                  className="input-dark w-full text-xs"
                  value={customArtist}
                  onChange={(e) => setCustomArtist(e.target.value)}
                />
              </div>

              {/* Upload de Áudio da Música (Opcional) */}
              <div>
                <label className="label-field text-xs text-[#a1a1aa] block mb-1.5">
                  Arquivo de Áudio da Faixa (Opcional)
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.ogg,.flac,.aac"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {customFile ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#141418] border border-[#22c55e]/40">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center text-[#4ade80] flex-shrink-0">
                        <FileAudio size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{customFile.name}</p>
                        <p className="text-[10px] text-[#71717a] font-mono">{formatFileSize(customFile.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCustomFile(null)}
                      className="p-1 rounded-lg text-[#71717a] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remover arquivo"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#272730] hover:border-[#22c55e]/50 bg-[#121215] hover:bg-[#16161a] rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
                  >
                    <div className="w-9 h-9 rounded-full bg-[#1e1e24] flex items-center justify-center text-[#71717a] group-hover:text-[#4ade80] group-hover:bg-[#22c55e]/10 transition-colors">
                      <UploadCloud size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#d4d4d8] group-hover:text-white">
                        Toque para selecionar áudio
                      </p>
                      <p className="text-[10px] text-[#71717a] mt-0.5">
                        MP3, WAV, M4A ou FLAC (até 50MB)
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-[10px] text-[#52525b] mt-1.5 leading-relaxed">
                  💡 Se não tiver o arquivo agora, você pode adicionar a faixa e subir as mixagens mais tarde no botão <strong>+ Versão</strong>.
                </p>
              </div>
            </div>

            <SheetFooter className="px-0 mt-3 pt-3 border-t border-[#1e1e24]">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="btn-secondary text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isUploading || !customTitle.trim()}
                className="btn-primary text-xs disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Enviando áudio...</span>
                  </>
                ) : (
                  <span>Adicionar Faixa ao Álbum</span>
                )}
              </button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  )
}
