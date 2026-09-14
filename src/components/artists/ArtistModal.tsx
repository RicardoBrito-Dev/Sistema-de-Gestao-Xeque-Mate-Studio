'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Artist, Genre, ArtistStatus } from '@/lib/types'
import { saveArtist, generateId } from '@/lib/storage'

interface ArtistModalProps {
  isOpen: boolean
  onClose: () => void
  artist: Artist | null
  onSave: () => void
}

export default function ArtistModal({
  isOpen,
  onClose,
  artist,
  onSave,
}: ArtistModalProps) {
  const [artisticName, setArtisticName] = useState('')
  const [realName, setRealName] = useState('')
  const [genre, setGenre] = useState<Genre>('funk')
  const [status, setStatus] = useState<ArtistStatus>('ativo')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [instagram, setInstagram] = useState('')
  const [spotify, setSpotify] = useState('')
  const [youtube, setYoutube] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    if (artist) {
      setArtisticName(artist.artisticName)
      setRealName(artist.realName)
      setGenre(artist.genre)
      setStatus(artist.status)
      setPhone(artist.phone)
      setEmail(artist.email)
      setInstagram(artist.instagram || '')
      setSpotify(artist.spotify || '')
      setYoutube(artist.youtube || '')
      setBio(artist.bio || '')
    } else {
      setArtisticName('')
      setRealName('')
      setGenre('funk')
      setStatus('ativo')
      setPhone('')
      setEmail('')
      setInstagram('')
      setSpotify('')
      setYoutube('')
      setBio('')
    }
  }, [artist, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!artisticName || !phone) {
      alert('Nome Artístico e Celular são obrigatórios.')
      return
    }

    const payload: Artist = {
      id: artist?.id || generateId(),
      artisticName,
      realName,
      genre,
      status,
      phone,
      email,
      instagram: instagram || undefined,
      spotify: spotify || undefined,
      youtube: youtube || undefined,
      bio: bio || undefined,
      projectCount: artist?.projectCount || 0,
      totalRevenue: artist?.totalRevenue || 0,
      joinedAt: artist?.joinedAt || new Date().toISOString().split('T')[0],
    }

    saveArtist(payload)
    onSave()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={artist ? 'Editar Artista' : 'Novo Artista'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Nome Artístico *</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: MC Sombra"
              value={artisticName}
              onChange={(e) => setArtisticName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label-field">Nome Real</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: Lucas Ferreira"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Gênero Principal</label>
            <select
              className="input-dark"
              value={genre}
              onChange={(e) => setGenre(e.target.value as Genre)}
            >
              <option value="funk">Funk</option>
              <option value="rap">Rap</option>
              <option value="dj">DJ / Produtor</option>
              <option value="trap">Trap</option>
              <option value="drill">Drill</option>
              <option value="r&b">R&B</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label className="label-field">Status do Contrato</label>
            <select
              className="input-dark"
              value={status}
              onChange={(e) => setStatus(e.target.value as ArtistStatus)}
            >
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">WhatsApp / Celular *</label>
            <input
              type="tel"
              className="input-dark"
              placeholder="Ex: (11) 99999-9999"
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
              placeholder="Ex: contato@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label-field">Instagram (@)</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: @username"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Nome no Spotify</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: MC Sombra"
              value={spotify}
              onChange={(e) => setSpotify(e.target.value)}
            />
          </div>
          <div>
            <label className="label-field">Canal YouTube</label>
            <input
              type="text"
              className="input-dark"
              placeholder="Ex: MC Sombra TV"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="label-field">Biografia / Observações</label>
          <textarea
            className="input-dark h-24 resize-none"
            placeholder="Escreva um breve perfil do artista..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-[#1e1e1e]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Salvar Artista
          </button>
        </div>
      </form>
    </Modal>
  )
}
