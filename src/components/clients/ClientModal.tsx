'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Client, ClientType } from '@/lib/types'
import { saveClient, generateId } from '@/lib/storage'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
  onSave: () => void
}

export default function ClientModal({
  isOpen,
  onClose,
  client,
  onSave,
}: ClientModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [clientType, setClientType] = useState<ClientType>('externo')
  const [instagram, setInstagram] = useState('')
  const [pendingBalance, setPendingBalance] = useState<number>(0)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (client) {
      setName(client.name)
      setPhone(client.phone)
      setEmail(client.email || '')
      setClientType(client.clientType)
      setInstagram(client.instagram || '')
      setPendingBalance(client.pendingBalance)
      setNotes(client.notes || '')
    } else {
      setName('')
      setPhone('')
      setEmail('')
      setClientType('externo')
      setInstagram('')
      setPendingBalance(0)
      setNotes('')
    }
  }, [client, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone) {
      alert('Nome e WhatsApp são obrigatórios.')
      return
    }

    const payload: Client = {
      id: client?.id || generateId(),
      name,
      phone,
      email: email || undefined,
      clientType,
      instagram: instagram || undefined,
      totalSessions: client?.totalSessions || 0,
      pendingBalance: Number(pendingBalance) || 0,
      totalSpent: client?.totalSpent || 0,
      notes: notes || undefined,
      createdAt: client?.createdAt || new Date().toISOString().split('T')[0],
    }

    saveClient(payload)
    onSave()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Editar Cliente' : 'Novo Cliente'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Nome Completo *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: Pedro Almeida"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-field">Tipo de Cliente</label>
            <select
              className="input-dark"
              value={clientType}
              onChange={(e) => setClientType(e.target.value as ClientType)}
            >
              <option value="externo">Externo (Avulso)</option>
              <option value="artista-casa">Artista da Casa</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">WhatsApp / Celular *</label>
            <input
              type="tel"
              className="input-dark"
              placeholder="Ex: (11) 98888-8888"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-field">E-mail</label>
            <input
              type="email"
              className="input-dark"
              placeholder="Ex: cliente@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Instagram (@)</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: @pedroalmeida"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Débito Pendente (R$)</label>
            <input
              type="number"
              className="input-dark"
              placeholder="Ex: 500"
              value={pendingBalance}
              onChange={(e) => setPendingBalance(parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="label-field">Observações do Cliente</label>
          <textarea
            className="input-dark h-24 resize-none"
            placeholder="Estilos preferidos, equipamentos favoritos, histórico de acordos..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-[#1e1e1e]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar Cliente
          </button>
        </div>
      </form>
    </Modal>
  )
}
