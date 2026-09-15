"use client"

import React, { useState, useEffect } from "react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from "@/components/ui/sheet"
import { KanbanCard, AlbumTrack } from "@/lib/types"
import { getKanbanCardsAsync } from "@/lib/storage"
import { Search, Music2, CheckSquare, Square, Layers } from "lucide-react"

interface AlbumTrackPickerProps {
  isOpen: boolean
  onClose: () => void
  existingTrackIds: string[]
  onAddTracks: (tracks: AlbumTrack[]) => void
}

export function AlbumTrackPicker({ isOpen, onClose, existingTrackIds, onAddTracks }: AlbumTrackPickerProps) {
  const [cards, setCards] = useState<KanbanCard[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setSelected(new Set())
      setSearch("")
      getKanbanCardsAsync().then((data) => {
        setCards(data)
        setLoading(false)
      })
    }
  }, [isOpen])

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

  const handleConfirm = () => {
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
      }))
    onAddTracks(newTracks)
    onClose()
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
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Adicionar Faixas</SheetTitle>
          <SheetDescription>Selecione faixas do quadro de produção para adicionar ao álbum</SheetDescription>
        </SheetHeader>

        {/* Search */}
        <div className="relative mt-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52525b]" />
          <input
            type="text"
            placeholder="Buscar por faixa ou artista..."
            className="input-dark pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 pr-0.5">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-[#52525b] text-sm">Carregando...</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-[#52525b]">
              <Music2 size={28} />
              <p className="text-sm">{search ? "Nenhuma faixa encontrada" : "Todas as faixas já foram adicionadas"}</p>
            </div>
          ) : (
            filtered.map((card) => {
              const isSelected = selected.has(card.id)
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => toggleSelect(card.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#22c55e]/40 bg-[#22c55e]/8'
                      : 'border-transparent bg-[#141416] hover:bg-[#1a1a1d]'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare size={16} className="text-[#22c55e] flex-shrink-0" />
                  ) : (
                    <Square size={16} className="text-[#3f3f46] flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#e4e4e7] truncate">{card.trackName}</p>
                    <p className="text-[11px] text-[#71717a] truncate">{card.artistName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {card.versions && card.versions.length > 0 && (
                      <span className="flex items-center gap-0.5 text-[10px] text-[#4ade80] bg-[#22c55e]/10 px-1.5 py-0.5 rounded font-mono">
                        <Layers size={9} />
                        {card.versions.length}v
                      </span>
                    )}
                    <span className="text-[10px] text-[#52525b] bg-[#1a1a1d] border border-[#27272a] px-1.5 py-0.5 rounded">
                      {stageLabel[card.stage] || card.stage}
                    </span>
                  </div>
                </button>
              )
            })
          )}
        </div>

        <SheetFooter className="px-0 mt-3">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="btn-primary disabled:opacity-50"
          >
            Adicionar {selected.size > 0 ? `(${selected.size})` : ""}
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
