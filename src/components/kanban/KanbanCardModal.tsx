'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { KanbanCard, KanbanStage, Priority } from '@/lib/types'
import { saveKanbanCardAsync, generateId } from '@/lib/storage'

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
    } else {
      setTrackName('')
      setArtistName('')
      setStage('gravacao')
      setPriority('normal')
      setEntryDate(new Date().toISOString().split('T')[0])
      setDeadline('')
      setNotes('')
      setDriveLink('')
    }
  }, [card, isOpen])

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
    }

    await saveKanbanCardAsync(payload)
    onSave()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={card ? 'Editar Música' : 'Nova Música'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div className="flex justify-end gap-3 pt-5 border-t border-[#1e1e1e]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar Música
          </button>
        </div>
      </form>
    </Modal>
  )
}
