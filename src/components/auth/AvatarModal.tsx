'use client'

import React, { useState, useRef } from 'react'
import { X, Camera, Check, Upload, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updateAvatar } from '@/lib/auth'

interface AvatarModalProps {
  isOpen: boolean
  onClose: () => void
}

const AVATAR_PRESETS = [
  { name: 'Mic Vintage', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop&crop=center' },
  { name: 'Studio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200&h=200&fit=crop&crop=center' },
  { name: 'Headphones', url: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?w=200&h=200&fit=crop&crop=center' },
  { name: 'Neon Show', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop&crop=center' },
  { name: 'Beats', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop&crop=center' },
  { name: 'Mixing', url: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=200&h=200&fit=crop&crop=center' },
  { name: 'Vinyl', url: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=200&h=200&fit=crop&crop=center' },
  { name: 'Concert', url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop&crop=center' },
]

export default function AvatarModal({ isOpen, onClose }: AvatarModalProps) {
  const { user, updateUser } = useAuth()
  const [preview, setPreview] = useState<string>(user?.avatarUrl || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen || !user) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      setError('A foto deve ter no máximo 3MB.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!preview || preview === user.avatarUrl) {
      onClose()
      return
    }
    setLoading(true)
    setError('')
    try {
      await updateAvatar(user.userId, preview)
      updateUser({ avatarUrl: preview })
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onClose()
      }, 1200)
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar a foto.')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    setError('')
  }

  return (
    <div className="fixed inset-0 bg-[#000]/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl w-full max-w-sm p-6 relative shadow-2xl animate-slide-up">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e1e1e]/60 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center">
              <Camera size={16} className="text-[#8B5CF6]" />
            </div>
            <div>
              <h2 className="font-bebas text-lg tracking-wider text-white">Foto de Perfil</h2>
              <p className="text-[10px] text-[#555] uppercase tracking-wider font-semibold">Alterar avatar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1e1e1e] hover:border-[#333] flex items-center justify-center text-[#555] hover:text-[#888] transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center gap-4 mb-5">
          <div className="relative group">
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-2 border-[#8B5CF6]/50 shadow-[0_0_24px_rgba(139,92,246,0.2)]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#8B5CF6]/10 border-2 border-[#8B5CF6]/30 flex items-center justify-center font-bebas text-2xl text-[#A78BFA]">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-full bg-[#000]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera size={20} className="text-white" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-[#A78BFA] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-3 py-1.5 rounded-lg hover:bg-[#8B5CF6]/20 transition-all cursor-pointer"
            >
              <Upload size={12} /> Enviar foto
            </button>
            {preview && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-1.5 text-xs text-[#555] bg-[#111] border border-[#1e1e1e] px-3 py-1.5 rounded-lg hover:text-[#888] hover:border-[#2a2a2a] transition-all cursor-pointer"
              >
                Remover
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Presets */}
        <div className="mb-5">
          <p className="text-[10px] text-[#444] uppercase tracking-[0.2em] font-semibold mb-3">Avatars predefinidos</p>
          <div className="grid grid-cols-4 gap-2">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = preview === preset.url
              return (
                <button
                  key={preset.url}
                  onClick={() => { setPreview(preset.url); setError('') }}
                  title={preset.name}
                  className={`relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#8B5CF6] scale-105 shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-[#2a2a2a]'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#8B5CF6]/30 flex items-center justify-center">
                      <Check size={14} strokeWidth={3} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-[#E74C3C] bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 justify-center cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="btn-primary flex-1 justify-center cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={14} className="animate-spin" /> Salvando...</>
            ) : success ? (
              <><Check size={14} /> Salvo!</>
            ) : (
              'Salvar Foto'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
