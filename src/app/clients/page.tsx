'use client'

import React, { useEffect, useState } from 'react'
import { getClients, deleteClient } from '@/lib/storage'
import { Client } from '@/lib/types'
import ClientModal from '@/components/clients/ClientModal'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { Users, Plus, Search, Instagram, Edit2, Trash2, Phone, Mail, AlertCircle } from 'lucide-react'

export default function ClientsPage() {
  const { canEdit } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  const loadData = () => setClients(getClients())
  useEffect(() => { loadData() }, [])

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Remover cliente "${name}"?`)) { deleteClient(id); loadData() }
  }
  const handleEdit = (client: Client) => { setSelectedClient(client); setIsModalOpen(true) }
  const handleNew = () => { setSelectedClient(null); setIsModalOpen(true) }

  const filtered = clients.filter(c => {
    const t = search.toLowerCase()
    return c.name.toLowerCase().includes(t) || (c.email && c.email.toLowerCase().includes(t)) || c.phone.includes(t)
  })

  const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  const totalPending = clients.reduce((a, c) => a + c.pendingBalance, 0)
  const totalSpent = clients.reduce((a, c) => a + c.totalSpent, 0)

  return (
    <div className="flex-1 w-full animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-6">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1e1e1e]">
          <div>
            <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">Clientes do Estúdio</h1>
            <p className="text-sm text-[#888] mt-1.5">Controle de clientes, sessões e pagamentos</p>
          </div>
          {canEdit && (
            <button onClick={handleNew} className="btn-primary">
              <Plus size={16} />Novo Cliente
            </button>
          )}
        </div>

        {/* ─── Summary bar ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl px-5 py-4 min-w-0">
            <span className="text-[10px] text-[#555] uppercase tracking-widest block">Total de Clientes</span>
            <span className="text-2xl font-bebas text-[#F0F0F0] tracking-wide mt-1.5 block">{clients.length}</span>
          </div>
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl px-5 py-4 min-w-0">
            <span className="text-[10px] text-[#555] uppercase tracking-widest block">Débitos em Aberto</span>
            <span className={`text-xl font-bebas tracking-wide mt-1.5 block truncate ${totalPending > 0 ? 'text-[#E74C3C]' : 'text-[#F0F0F0]'}`} title={fmt(totalPending)}>
              {fmt(totalPending)}
            </span>
          </div>
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl px-5 py-4 min-w-0">
            <span className="text-[10px] text-[#555] uppercase tracking-widest block">Investido no Estúdio</span>
            <span className="text-xl font-bebas text-gold tracking-wide mt-1.5 block truncate" title={fmt(totalSpent)}>{fmt(totalSpent)}</span>
          </div>
        </div>

        {/* ─── Search ─── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
            <input
              type="text"
              className="input-dark pl-10 text-sm"
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-[#555]">{filtered.length} de {clients.length} clientes</span>
        </div>

        {/* ─── Cards ─── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#222] rounded-2xl">
            <Users size={36} className="text-[#333] animate-float mb-3" />
            <p className="text-sm text-[#555] font-medium">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(client => (
              <div key={client.id} className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#2a2a2a] transition-all">

                {/* Top */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#C0392B]/10 border border-[#C0392B]/20 flex items-center justify-center font-bebas text-base text-[#E74C3C] flex-shrink-0">
                      {initials(client.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bebas text-lg text-[#F0F0F0] tracking-wide truncate leading-none">{client.name}</h3>
                      <p className="text-[10px] text-[#555] uppercase tracking-wider mt-0.5">
                        {client.clientType === 'artista-casa' ? 'Artista da Casa' : 'Cliente Externo'}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(client)} className="btn-icon">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDelete(client.id, client.name)} className="btn-icon btn-icon-danger">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant={client.clientType === 'artista-casa' ? 'gold' : 'blue'}>
                    {client.clientType === 'artista-casa' ? 'Artista' : 'Externo'}
                  </Badge>
                  {client.pendingBalance > 0 && (
                    <Badge variant="crimson">
                      <AlertCircle size={9} className="inline mr-1" />Débito
                    </Badge>
                  )}
                </div>

                {/* Contact */}
                <div className="space-y-1.5 text-xs text-[#666]">
                  <div className="flex items-center gap-2"><Phone size={11} className="text-[#444]" />{client.phone}</div>
                  {client.email && <div className="flex items-center gap-2 truncate"><Mail size={11} className="text-[#444] flex-shrink-0" />{client.email}</div>}
                  {client.instagram && <div className="flex items-center gap-2"><Instagram size={11} className="text-[#444]" />{client.instagram}</div>}
                </div>

                {client.notes && (
                  <p className="text-xs text-[#555] italic bg-[#0a0a0a] rounded-lg px-3 py-2.5 border border-[#1a1a1a] line-clamp-2">
                    {client.notes}
                  </p>
                )}

                {/* Bottom stats */}
                <div className="grid grid-cols-3 gap-2 pt-3 mt-auto border-t border-[#1a1a1a]">
                  <div className="text-center min-w-0">
                    <span className="text-[9px] text-[#555] uppercase tracking-widest block">Sessões</span>
                    <span className="text-base font-bebas text-[#F0F0F0] mt-1 block">{client.totalSessions}</span>
                  </div>
                  <div className="text-center min-w-0">
                    <span className="text-[9px] text-[#555] uppercase tracking-widest block leading-tight">Pendente</span>
                    <span
                      className={`text-xs font-bold mt-1 block truncate ${client.pendingBalance > 0 ? 'text-[#E74C3C]' : 'text-[#F0F0F0]'}`}
                      title={fmt(client.pendingBalance)}
                    >
                      {fmt(client.pendingBalance)}
                    </span>
                  </div>
                  <div className="text-center min-w-0">
                    <span className="text-[9px] text-[#555] uppercase tracking-widest block leading-tight">Gasto</span>
                    <span
                      className="text-xs font-bold text-gold mt-1 block truncate"
                      title={fmt(client.totalSpent)}
                    >
                      {fmt(client.totalSpent)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <ClientModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} client={selectedClient} onSave={loadData} />
      )}
    </div>
  )
}
