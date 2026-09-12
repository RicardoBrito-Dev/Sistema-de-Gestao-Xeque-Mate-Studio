'use client'

import React, { useState } from 'react'
import { X, Lock, Eye, EyeOff, Key, Check } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { updatePassword } from '@/lib/auth'

interface ChangePasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { user } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !user) return null

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' }
    let score = 0
    if (pass.length >= 6) score += 1
    if (pass.length >= 8) score += 1
    if (/[A-Z]/.test(pass)) score += 1
    if (/[0-9]/.test(pass)) score += 1
    if (/[^A-Za-z0-9]/.test(pass)) score += 1
    
    if (score <= 1) return { score, label: 'Muito Fraca', color: 'bg-rose-500 w-1/4' }
    if (score === 2) return { score, label: 'Fraca', color: 'bg-orange-500 w-2/4' }
    if (score === 3) return { score, label: 'Média', color: 'bg-yellow-500 w-3/4' }
    return { score, label: 'Forte', color: 'bg-emerald-500 w-full' }
  }
  
  const strength = getPasswordStrength(newPassword)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (newPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError('As novas senhas não coincidem.')
      setLoading(false)
      return
    }

    try {
      await updatePassword(user.userId, currentPassword, newPassword)
      setSuccess('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => {
        onClose()
        setSuccess('')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar a senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[#000]/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1e1e1e]/60 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#16a34a]/10 border border-[#16a34a]/30 flex items-center justify-center">
              <Key size={16} className="text-[#16a34a]" />
            </div>
            <div>
              <h2 className="font-bebas text-lg tracking-wider text-white">Alterar Senha</h2>
              <p className="text-[10px] text-[#555] uppercase tracking-wider font-semibold">Conta de {user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg border border-[#1e1e1e] hover:border-[#333] flex items-center justify-center text-[#555] hover:text-[#888] transition-all cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="label-field">Senha Atual</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={14} />
              <input
                type={showCurrent ? 'text' : 'password'}
                className="input-dark pl-10 pr-10 text-sm"
                placeholder="Sua senha atual"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors cursor-pointer"
              >
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="label-field">Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={14} />
              <input
                type={showNew ? 'text' : 'password'}
                className="input-dark pl-10 pr-10 text-sm"
                placeholder="No mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors cursor-pointer"
              >
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-[#555]">Força da Senha:</span>
                  <span className={
                    strength.score <= 2 ? 'text-rose-400' : strength.score === 3 ? 'text-yellow-400' : 'text-emerald-400'
                  }>{strength.label}</span>
                </div>
                <div className="h-1 w-full bg-[#1e1e1e] rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color}`}></div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="label-field">Confirmar Nova Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={14} />
              <input
                type={showConfirm ? 'text' : 'password'}
                className="input-dark pl-10 pr-10 text-sm"
                placeholder="Repita a nova senha"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors cursor-pointer"
              >
                {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <p className="text-xs text-[#E74C3C] bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {success && (
            <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <Check size={12} />
              {success}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 justify-center cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 justify-center cursor-pointer"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
