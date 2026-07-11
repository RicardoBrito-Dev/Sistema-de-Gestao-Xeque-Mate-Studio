'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Session, ServiceType, SessionStatus } from '@/lib/types'
import { saveSession, generateId, getClients, getArtists, getSessions } from '@/lib/storage'
import { AlertCircle } from 'lucide-react'

interface SessionModalProps {
  isOpen: boolean
  onClose: () => void
  session: Session | null
  onSave: () => void
  defaultDate?: string
}

export default function SessionModal({
  isOpen,
  onClose,
  session,
  onSave,
  defaultDate,
}: SessionModalProps) {
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType>('gravacao')
  const [status, setStatus] = useState<SessionStatus>('confirmado')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [value, setValue] = useState<number>(0)
  const [notes, setNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    // Collect clients and artists for dropdown
    const clients = getClients().map(c => ({ id: c.id, name: c.name }))
    const artists = getArtists().map(a => ({ id: a.id, name: `${a.artisticName} (Casa)` }))
    setAvailableClients([...clients, ...artists])
    setErrorMsg('') // Clear error message when modal state changes

    if (session) {
      setTitle(session.title)
      setClientId(session.clientId)
      setClientName(session.clientName)
      setServiceType(session.serviceType)
      setStatus(session.status)
      setDate(session.date)
      setStartTime(session.startTime)
      setEndTime(session.endTime)
      setValue(session.value || 0)
      setNotes(session.notes || '')
    } else {
      setTitle('')
      setClientId('')
      setClientName('')
      setServiceType('gravacao')
      setStatus('confirmado')
      setDate(defaultDate || new Date().toISOString().split('T')[0])
      setStartTime('14:00')
      setEndTime('18:00')
      setValue(0)
      setNotes('')
    }
  }, [session, isOpen, defaultDate])

  const handleSelectClient = (id: string) => {
    setClientId(id)
    const match = availableClients.find(c => c.id === id)
    if (match) {
      setClientName(match.name)
      // Auto-set a reasonable title if empty
      if (!title) {
        setTitle(`Sessão ${match.name.split(' ')[0]}`)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !clientName || !date || !startTime || !endTime) {
      setErrorMsg('Preencha os campos obrigatórios (*).')
      return
    }

    if (startTime >= endTime) {
      setErrorMsg('O horário de término deve ser posterior ao horário de início.')
      return
    }

    // Get all sessions from storage to check for overlap
    const allSessions = getSessions()
    
    // Find overlapping session on the same date (excluding the current one and cancelled ones)
    const overlappingSession = allSessions.find(s => {
      if (session && s.id === session.id) return false
      if (s.status === 'cancelado') return false
      if (s.date !== date) return false
      return startTime < s.endTime && endTime > s.startTime
    })

    if (overlappingSession) {
      setErrorMsg(`Horário indisponível. Já existe outro agendamento neste período:\n"${overlappingSession.title}" (${overlappingSession.startTime} - ${overlappingSession.endTime})`)
      return
    }

    const payload: Session = {
      id: session?.id || generateId(),
      title,
      clientId: clientId || 'externo',
      clientName,
      serviceType,
      status,
      date,
      startTime,
      endTime,
      value: Number(value) || undefined,
      notes: notes || undefined,
      createdAt: session?.createdAt || new Date().toISOString(),
    }

    saveSession(payload)
    onSave()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={session ? 'Editar Sessão' : 'Agendar Sessão'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="flex items-start gap-2 bg-crimson-muted border border-crimson/20 text-crimson-light text-xs rounded-lg p-3 animate-fade-in">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="whitespace-pre-line">{errorMsg}</span>
          </div>
        )}
        <div>
          <label className="label-field">Título da Sessão *</label>
          <input
            type="text"
            className="input-dark"
            placeholder="Ex: Gravação Vocais"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label-field">Cliente / Rapper *</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              className="input-dark"
              value={clientId}
              onChange={(e) => handleSelectClient(e.target.value)}
            >
              <option value="">-- Selecione ou digite abaixo --</option>
              {availableClients.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input
              type="text"
              className="input-dark"
              placeholder="Nome manual se não cadastrado"
              value={clientName}
              onChange={(e) => {
                setClientName(e.target.value)
                setClientId('') // Custom manual name resets dropdown linkage
              }}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Tipo de Serviço</label>
            <select
              className="input-dark"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as ServiceType)}
            >
              <option value="gravacao">Gravação</option>
              <option value="mix">Mixagem</option>
              <option value="master">Masterização</option>
              <option value="recall">Recall</option>
              <option value="producao">Produção</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="label-field">Status da Sessão</label>
            <select
              className="input-dark"
              value={status}
              onChange={(e) => setStatus(e.target.value as SessionStatus)}
            >
              <option value="confirmado">Confirmada</option>
              <option value="pendente">Pendente</option>
              <option value="cancelado">Cancelada</option>
              <option value="concluido">Concluída</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Data *</label>
            <input
              type="date"
              className="input-dark"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-field">Início *</label>
            <input
              type="time"
              className="input-dark"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-field">Fim *</label>
            <input
              type="time"
              className="input-dark"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="label-field">Valor Estimado (R$)</label>
          <input
            type="number"
            className="input-dark"
            placeholder="Ex: 600"
            value={value}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div>
          <label className="label-field">Anotações da Sessão</label>
          <textarea
            className="input-dark h-20 resize-none"
            placeholder="Observações de setup, batida contratada, microfones recomendados..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-[#1e1e1e]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Agendar Sessão
          </button>
        </div>
      </form>
    </Modal>
  )
}
