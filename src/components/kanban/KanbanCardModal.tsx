'use client'

import React, { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { KanbanCard, KanbanStage, Priority, TrackVersion } from '@/lib/types'
import { saveKanbanCardAsync, generateId } from '@/lib/storage'
import { AudioDropzone } from '@/components/audio/AudioDropzone'
import { useAudioPlayer } from '@/contexts/AudioPlayerContext'
import { deleteAudioBlob } from '@/lib/audioStorage'
import { Play, Star, Trash2, Music2 } from 'lucide-react'

interface KanbanCardModalProps {
  isOpen: boolean
  onClose: () => void
  card: KanbanCard | null
  onSave: () => void
}

export default function KanbanCardModal({
  isOpen,
  onClose,
  card,
  onSave,
}: KanbanCardModalProps) {
  const [trackName, setTrackName] = useState('')
  const [artistName, setArtistName] = useState('')
  const [stage, setStage] = useState<KanbanStage>('gravacao')
  const [priority, setPriority] = useState<Priority>('normal')
  const [entryDate, setEntryDate] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')
  const [driveLink, setDriveLink] = useState('')
  const [versions, setVersions] = useState<TrackVersion[]>([])
  const [activeVersionId, setActiveVersionId] = useState<string | undefined>(undefined)

  const { playTrack } = useAudioPlayer()

  useEffect(() => {
    if (card) {
      setTrackName(card.trackName)
      setArtistName(card.artistName)
      setStage(card.stage)
      setPriority(card.priority)
      setEntryDate(card.entryDate)
      setDeadline(card.deadline || '')
      setNotes(card.notes || '')
      setDriveLink(card.driveLink || '')
      setVersions(card.versions || [])
      setActiveVersionId(card.activeVersionId)
    } else {
      setTrackName('')
      setArtistName('')
      setStage('gravacao')
      setPriority('normal')
      setEntryDate(new Date().toISOString().split('T')[0])
      setDeadline('')
      setNotes('')
      setDriveLink('')
      setVersions([])
      setActiveVersionId(undefined)
    }
  }, [card, isOpen])

  const handleVersionAdded = (version: TrackVersion) => {
    setVersions((prev) => {
      const updated = [...prev, version]
      // Auto-set as active if first version
      if (updated.length === 1) setActiveVersionId(version.id)
      return updated
    })
  }

  const handleMarkFinal = (versionId: string) => {
    setVersions((prev) =>
      prev.map((v) => ({ ...v, isFinal: v.id === versionId }))
    )
    setActiveVersionId(versionId)
  }

  const handleDeleteVersion = async (versionId: string) => {
    await deleteAudioBlob(versionId)
    setVersions((prev) => {
      const updated = prev.filter((v) => v.id !== versionId)
      if (activeVersionId === versionId) {
        setActiveVersionId(updated.length > 0 ? updated[updated.length - 1].id : undefined)
      }
      return updated
    })
  }

  const handlePlayVersion = (version: TrackVersion) => {
    playTrack(
      {
        id: card?.id || 'preview',
        title: trackName || 'Prévia',
        artist: artistName || '',
        versions,
        activeVersionId: version.id,
      },
      version.id
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trackName || !artistName) {
      alert('Nome da Música e Artista/Cliente são obrigatórios.')
      return
    }

    const payload: KanbanCard = {
      id: card?.id || generateId(),
      trackName,
      artistName,
      stage,
      priority,
      entryDate: entryDate || new Date().toISOString().split('T')[0],
      deadline: deadline || undefined,
      notes: notes || undefined,
      driveLink: driveLink || undefined,
      daysInStage: card?.daysInStage || 0,
      versions: versions.length > 0 ? versions : undefined,
      activeVersionId: activeVersionId || undefined,
    }

    await saveKanbanCardAsync(payload)
    onSave()
    onClose()
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md md:max-w-lg">
        <SheetHeader>
          <SheetTitle>{card ? 'Editar Música' : 'Nova Música'}</SheetTitle>
          <SheetDescription>
            {card ? `Ajuste os dados de "${card.trackName}"` : 'Adicione uma nova faixa ao fluxo de produção'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-5">
          <div>
            <label className="label-field">Nome da Faixa / Música *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: Favela Vive Pt. 5"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label-field">Artista / Cliente *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: MC Sombra"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Estágio de Produção</label>
              <select
                className="input-dark"
                value={stage}
                onChange={(e) => setStage(e.target.value as KanbanStage)}
              >
                <option value="gravacao">Gravação</option>
                <option value="mix">Mixagem</option>
                <option value="master">Masterização</option>
                <option value="recall">Recall</option>
                <option value="entregue">Entregue / Concluído</option>
              </select>
            </div>
            <div>
              <label className="label-field">Prioridade</label>
              <select
                className="input-dark"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="normal">Normal</option>
                <option value="urgente">Urgente</option>
                <option value="espera">Em Espera</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Data de Entrada</label>
              <input
                type="date"
                className="input-dark"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
              />
            </div>
            <div>
              <label className="label-field">Prazo de Entrega (Opcional)</label>
              <input
                type="date"
                className="input-dark"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label-field">Link do Google Drive / Guia (Opcional)</label>
            <input
              type="url"
              className="input-dark"
              placeholder="Ex: https://drive.google.com/file/d/..."
              value={driveLink}
              onChange={(e) => setDriveLink(e.target.value)}
            />
          </div>

          <div>
            <label className="label-field">Anotações da Música</label>
            <textarea
              className="input-dark h-24 resize-none"
              placeholder="Ajustes pendentes na mix, referências musicais, prazos..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* ── Versões da Faixa ─────────────────────────────────────── */}
          <div className="border-t border-[#1e1e22] pt-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Music2 size={14} className="text-[#22c55e]" />
                <span className="text-xs font-semibold text-[#d4d4d8] uppercase tracking-widest">
                  Versões da Faixa
                </span>
                {versions.length > 0 && (
                  <span className="text-[10px] bg-[#22c55e]/15 text-[#4ade80] px-1.5 py-0.5 rounded-full font-mono">
                    {versions.length}
                  </span>
                )}
              </div>
              <AudioDropzone
                compact
                existingVersions={versions}
                onVersionAdded={handleVersionAdded}
              />
            </div>

            {versions.length === 0 ? (
              <AudioDropzone
                existingVersions={versions}
                onVersionAdded={handleVersionAdded}
                className="h-28"
              />
            ) : (
              <ul className="space-y-1.5">
                {versions.map((v) => (
                  <li
                    key={v.id}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all ${
                      v.isFinal
                        ? 'border-[#22c55e]/40 bg-[#22c55e]/8'
                        : activeVersionId === v.id
                        ? 'border-[#27272a] bg-[#1a1a1d]'
                        : 'border-transparent bg-[#141416] hover:bg-[#1a1a1d]'
                    }`}
                  >
                    {/* Play button */}
                    <button
                      type="button"
                      onClick={() => handlePlayVersion(v)}
                      className="flex-shrink-0 h-7 w-7 rounded-full bg-[#22c55e]/15 hover:bg-[#22c55e]/30 text-[#4ade80] flex items-center justify-center transition-all active:scale-90"
                      title="Ouvir esta versão"
                    >
                      <Play size={10} className="fill-[#4ade80] ml-0.5" />
                    </button>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#e4e4e7] truncate flex items-center gap-1.5">
                        {v.name}
                        {v.isFinal && (
                          <span className="text-[9px] font-bold text-[#22c55e] bg-[#22c55e]/15 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                            Final
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#52525b] truncate font-mono mt-0.5">
                        {v.fileName}{v.fileSize ? ` · ${v.fileSize}` : ''}
                      </p>
                    </div>

                    {/* Mark final */}
                    <button
                      type="button"
                      onClick={() => handleMarkFinal(v.id)}
                      title={v.isFinal ? 'Versão final' : 'Marcar como final'}
                      className={`flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center transition-all active:scale-90 ${
                        v.isFinal
                          ? 'text-[#facc15] bg-[#facc15]/15'
                          : 'text-[#3f3f46] hover:text-[#facc15] hover:bg-[#facc15]/10'
                      }`}
                    >
                      <Star size={11} className={v.isFinal ? 'fill-[#facc15]' : ''} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteVersion(v.id)}
                      title="Remover versão"
                      className="flex-shrink-0 h-6 w-6 rounded-lg text-[#3f3f46] hover:text-[#f87171] hover:bg-[#f87171]/10 flex items-center justify-center transition-all active:scale-90"
                    >
                      <Trash2 size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <SheetFooter className="px-0">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              Salvar Música
            </button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
