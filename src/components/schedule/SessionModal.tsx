'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Session, ServiceType, SessionStatus } from '@/lib/types'
import { saveSession, generateId, getClientsAsync, getArtistsAsync, getSessionsAsync } from '@/lib/storage'
import { AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

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
  const { user } = useAuth()
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
  
  const [sessionType, setSessionType] = useState<'estudio' | 'show'>('estudio')
  const [address, setAddress] = useState('')

  const [availableClients, setAvailableClients] = useState<{ id: string; name: string; displayName: string }[]>([])

  useEffect(() => {
    let isMounted = true
    // Collect clients and artists asynchronously for dropdown
    Promise.all([getClientsAsync(), getArtistsAsync()]).then(([clients, artists]) => {
      if (!isMounted) return
      const mappedClients = clients.map(c => ({ id: c.id, name: c.name, displayName: c.name }))
      const mappedArtists = artists.map(a => ({ id: a.id, name: a.artisticName, displayName: `${a.artisticName} (Casa)` }))
      setAvailableClients([...mappedClients, ...mappedArtists])
    })

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
      setSessionType(session.sessionType || 'estudio')
      setAddress(session.address || '')
    } else {
      setTitle('')
      if (user && user.role === 'artist') {
        setClientId(user.artistId || '')
        setClientName(user.name)
        setTitle(`Agendamento ${user.name}`)
      } else {
        setClientId('')
        setClientName('')
      }
      setServiceType('gravacao')
      setStatus('confirmado')
      setDate(defaultDate || new Date().toISOString().split('T')[0])
      setStartTime('14:00')
      setEndTime('18:00')
      setValue(0)
      setNotes('')
      setSessionType('estudio')
      setAddress('')
    }

    return () => {
      isMounted = false
    }
  }, [session, isOpen, defaultDate, user])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !clientName || !date || !startTime || !endTime) {
      setErrorMsg('Preencha os campos obrigatórios (*).')
      return
    }

    if (startTime >= endTime) {
      setErrorMsg('O horário de término deve ser posterior ao horário de início.')
      return
    }

    if (sessionType === 'show' && !address) {
      setErrorMsg('Preencha o endereço do show.')
      return
    }

    if (sessionType === 'show' && !value) {
      setErrorMsg('Preencha o valor do cachê.')
      return
    }

    // Get all sessions to check for overlap
    const allSessions = await getSessionsAsync()
    
    // Find overlapping studio session on the same date (excluding the current one and cancelled ones)
    // Note: Studio sessions overlap check applies to studio bookings
    const overlappingSession = allSessions.find(s => {
      if (session && s.id === session.id) return false
      if (s.status === 'cancelado') return false
      if (s.date !== date) return false
      if (sessionType === 'estudio' && (s.sessionType || 'estudio') === 'estudio') {
        return startTime < s.endTime && endTime > s.startTime
      }
      return false
    })

    if (overlappingSession) {
      setErrorMsg(`Horário indisponível no estúdio. Já existe outro agendamento neste período:\n"${overlappingSession.title}" (${overlappingSession.startTime} - ${overlappingSession.endTime})`)
      return
    }

    const payload: Session = {
      id: session?.id || generateId(),
      title,
      clientId: clientId || 'externo',
      clientName,
      serviceType: sessionType === 'show' ? 'outro' : serviceType,
      status,
      date,
      startTime,
      endTime,
      value: Number(value) || undefined,
      notes: notes || undefined,
      createdAt: session?.createdAt || new Date().toISOString(),
      sessionType,
      address: sessionType === 'show' ? address : undefined,
    }

    saveSession(payload)
    onSave()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        session 
          ? (sessionType === 'show' ? 'Editar Show' : 'Editar Sessão') 
          : (sessionType === 'show' ? 'Agendar Show' : 'Agendar Sessão')
      }
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMsg && (
          <div className="flex items-start gap-2 bg-crimson-muted border border-crimson/20 text-crimson-light text-xs rounded-lg p-3 animate-fade-in">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="whitespace-pre-line">{errorMsg}</span>
          </div>
        )}

        {/* Toggle Studio / Show */}
        <div>
          <label className="label-field">Tipo de Agenda</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSessionType('estudio')}
              className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                sessionType === 'estudio'
                  ? 'bg-[#16a34a]/10 border-[#16a34a] text-[#4ade80] shadow-[0_0_10px_rgba(22,163,74,0.1)]'
                  : 'bg-transparent border-[#1e1e1e] text-[#555] hover:text-[#888]'
              }`}
            >
              Agenda de Estúdio
            </button>
            <button
              type="button"
              onClick={() => setSessionType('show')}
              className={`py-2.5 px-4 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                sessionType === 'show'
                  ? 'bg-[#16a34a]/10 border-[#16a34a] text-[#4ade80] shadow-[0_0_10px_rgba(22,163,74,0.1)]'
                  : 'bg-transparent border-[#1e1e1e] text-[#555] hover:text-[#888]'
              }`}
            >
              Agenda de Shows
            </button>
          </div>
        </div>

        <div>
          <label className="label-field">
            {sessionType === 'show' ? 'Nome do Evento / Show *' : 'Título da Sessão *'}
          </label>
          <input
            type="text"
            className="input-dark"
            placeholder={sessionType === 'show' ? 'Ex: Show Festival de Inverno' : 'Ex: Gravação Vocais'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {user && user.role === 'admin' ? (
          <div>
            <label className="label-field">
              {sessionType === 'show' ? 'Artista do Show *' : 'Cliente / Rapper *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                className="input-dark"
                value={clientId}
                onChange={(e) => handleSelectClient(e.target.value)}
              >
                <option value="">-- Selecione ou digite abaixo --</option>
                {availableClients.map(c => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
              <input
                type="text"
                className="input-dark"
                placeholder={sessionType === 'show' ? 'Nome do artista manual' : 'Nome manual se não cadastrado'}
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value)
                  setClientId('') // Custom manual name resets dropdown linkage
                }}
                required
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="label-field">Agendado Para</label>
            <input
              type="text"
              className="input-dark bg-[#0e0e10] border-[#1a1a1c] text-[#666] cursor-not-allowed"
              value={clientName}
              disabled
            />
          </div>
        )}

        {sessionType === 'estudio' ? (
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
        ) : (
          <div>
            <label className="label-field">Status do Show</label>
            <select
              className="input-dark"
              value={status}
              onChange={(e) => setStatus(e.target.value as SessionStatus)}
            >
              <option value="confirmado">Confirmado</option>
              <option value="pendente">Pendente / Negociação</option>
              <option value="cancelado">Cancelado</option>
              <option value="concluido">Concluído</option>
            </select>
          </div>
        )}

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

        {sessionType === 'show' && (
          <div>
            <label className="label-field">Endereço do Show *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
        )}

        <div>
          <label className="label-field">
            {sessionType === 'show' ? 'Valor do Cachê (R$) *' : 'Valor Estimado (R$)'}
          </label>
          <input
            type="number"
            className="input-dark"
            placeholder={sessionType === 'show' ? 'Ex: 5000' : 'Ex: 600'}
            value={value || ''}
            onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            required={sessionType === 'show'}
          />
        </div>

        <div>
          <label className="label-field">
            {sessionType === 'show' ? 'Observações do Show' : 'Anotações da Sessão'}
          </label>
          <textarea
            className="input-dark h-20 resize-none"
            placeholder={
              sessionType === 'show'
                ? 'Informações sobre camarim, passagens, som, passagem de som, etc.'
                : 'Observações de setup, batida contratada, microfones recomendados...'
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-[#1e1e1e]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary cursor-pointer">
            {sessionType === 'show' ? 'Agendar Show' : 'Agendar Sessão'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
