'use client'

import React, { useEffect, useState } from 'react'
import { getArtists, deleteArtist } from '@/lib/storage'
import { Artist } from '@/lib/types'
import ArtistModal from '@/components/artists/ArtistModal'
import UsersModal from '@/components/artists/UsersModal'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { filterArtistsForUser } from '@/lib/permissions'
import { Mic2, Plus, Search, Instagram, Play, Youtube, Trash2, Edit2, Phone, Users } from 'lucide-react'

export default function ArtistsPage() {
  const { user, canEdit } = useAuth()
  const [artists, setArtists] = useState<Artist[]>([])
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)

  const loadData = () => setArtists(filterArtistsForUser(getArtists(), user))
  useEffect(() => { loadData() }, [user])

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Excluir artista "${name}"?`)) { deleteArtist(id); loadData() }
  }
  const handleEdit = (artist: Artist) => { setSelectedArtist(artist); setIsModalOpen(true) }
  const handleNew = () => { setSelectedArtist(null); setIsModalOpen(true) }

  const filtered = artists.filter(a => {
    const t = search.toLowerCase()
    return a.artisticName.toLowerCase().includes(t) || a.realName.toLowerCase().includes(t) || a.genre.toLowerCase().includes(t)
  })

  const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)
  const initials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  const statusColor: Record<Artist['status'], 'green' | 'yellow' | 'gray'> = { ativo: 'green', pausado: 'yellow', inativo: 'gray' }
  const formatPhone = (p: string) => {
    const c = p.replace(/\D/g, '')
    if (c.length === 11) return `(${c.slice(0, 2)}) ${c.slice(2, 7)}-${c.slice(7)}`
    if (c.length === 10) return `(${c.slice(0, 2)}) ${c.slice(2, 6)}-${c.slice(6)}`
    return p
  }

  return (
    <div className="flex-1 w-full animate-fade-in">
      <div className="max-w-[1400px] mx-auto pl-6 sm:pl-10 md:pl-16 lg:pl-20 pr-6 sm:pr-8 md:pr-12 lg:pr-14 py-8 md:py-12 space-y-6">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1e1e1e]">
          <div>
            <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">
              {canEdit ? 'Artistas da Produtora' : 'Meu Perfil'}
            </h1>
            <p className="text-sm text-[#888] mt-1.5">
              {canEdit ? 'Gerencie o casting de artistas da Xeque Mate' : 'Visualize suas informações no estúdio'}
            </p>
          </div>
          {canEdit && (
            <div className="flex gap-3">
              <button onClick={() => setIsUsersModalOpen(true)} className="btn-secondary cursor-pointer">
                <Users size={16} />Gerenciar Contas
              </button>
              <button onClick={handleNew} className="btn-primary cursor-pointer">
                <Plus size={16} />Novo Artista
              </button>
            </div>
          )}
        </div>

        {/* ─── Search bar ─── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
            <input
              type="text"
              className="input-dark pl-10 text-sm"
              placeholder="Buscar artista..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs text-[#555]">{filtered.length} de {artists.length} artistas</span>
        </div>

        {/* ─── Cards Grid ─── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#222] rounded-2xl">
            <Mic2 size={36} className="text-[#333] animate-float mb-3" />
            <p className="text-sm text-[#555] font-medium">Nenhum artista encontrado</p>
            <p className="text-xs text-[#444] mt-1">Ajuste a busca ou cadastre um novo artista.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(artist => (
              <div
                key={artist.id}
                className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#2a2a2a] transition-all"
              >
                {/* Top: Avatar + Name + Actions */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {artist.avatar ? (
                      <img
                        src={artist.avatar}
                        alt={artist.artisticName}
                        className="w-12 h-12 rounded-full object-cover border border-[#8B5CF6]/30 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center font-bebas text-base text-gold flex-shrink-0">
                        {initials(artist.artisticName)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bebas text-lg text-[#F0F0F0] tracking-wide truncate leading-none">
                        {artist.artisticName}
                      </h3>
                      <p className="text-xs text-[#666] mt-0.5 truncate">{artist.realName || '—'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {canEdit && (
                      <>
                        <button onClick={() => handleEdit(artist)} className="btn-icon" title="Editar">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => handleDelete(artist.id, artist.artisticName)} className="btn-icon btn-icon-danger" title="Excluir">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="gold">{artist.genre}</Badge>
                  <Badge variant={statusColor[artist.status]}>{artist.status}</Badge>
                </div>

                {/* Bio */}
                {artist.bio && (
                  <p className="text-xs text-[#666] italic line-clamp-2 bg-[#0a0a0a] rounded-lg px-3 py-2.5 border border-[#1a1a1a]">
                    {artist.bio}
                  </p>
                )}

                {/* Divider stats */}
                <div className="grid grid-cols-2 gap-3 pt-3 mt-auto border-t border-[#1a1a1a]">
                  <div className="bg-[#0d0d0d] rounded-lg px-3 py-2.5 text-center">
                    <span className="text-[9px] text-[#555] uppercase tracking-widest block">Projetos</span>
                    <span className="text-base font-bebas text-[#F0F0F0] mt-1 block">{artist.projectCount}</span>
                  </div>
                  <div className="bg-[#0d0d0d] rounded-lg px-3 py-2.5 text-center">
                    <span className="text-[9px] text-[#555] uppercase tracking-widest block">Faturado</span>
                    <span className="text-base font-bebas text-gold mt-1 block">{fmt(artist.totalRevenue)}</span>
                  </div>
                </div>

                {/* Socials & contact */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {artist.instagram && (
                      <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#555] hover:text-white transition-colors">
                        <Instagram size={12} />
                      </a>
                    )}
                    {artist.spotify && (
                      <span title={`Spotify: ${artist.spotify}`} className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#555] hover:text-[#1DB954] transition-colors cursor-pointer">
                        <Play size={12} />
                      </span>
                    )}
                    {artist.youtube && (
                      <span title={`YouTube: ${artist.youtube}`} className="p-1.5 rounded-lg bg-[#1a1a1a] text-[#555] hover:text-[#FF0000] transition-colors cursor-pointer">
                        <Youtube size={12} />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#555]">
                    <span title={artist.phone} className="flex items-center gap-1.5 hover:text-[#888] transition-colors">
                      <Phone size={10} className="text-[#444]" />
                      {formatPhone(artist.phone)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {canEdit && (
        <>
          <ArtistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} artist={selectedArtist} onSave={loadData} />
          <UsersModal isOpen={isUsersModalOpen} onClose={() => setIsUsersModalOpen(false)} />
        </>
      )}
    </div>
  )
}
