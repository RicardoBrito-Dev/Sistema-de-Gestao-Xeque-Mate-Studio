'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Crown, Mail, Lock, LogIn, Eye, EyeOff, Shield, Mic2 } from 'lucide-react'
import { mockUsers } from '@/lib/mockUsers'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = login(email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('E-mail ou senha incorretos')
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
  }

  const adminUsers = mockUsers.filter(u => u.role === 'admin')
  const artistUsers = mockUsers.filter(u => u.role === 'artist')

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#060606] px-4 py-8 sm:py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center animate-pulse-gold mb-4">
            <Crown size={32} className="text-[#8B5CF6]" />
          </div>
          <h1
            className="font-bebas text-4xl tracking-widest"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Xeque Mate
          </h1>
          <p className="text-xs text-[#555] tracking-[0.25em] uppercase mt-1">Studio Management</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <h2 className="font-bebas text-2xl text-[#F0F0F0] tracking-wider mb-1">Entrar</h2>
          <p className="text-sm text-[#666] mb-6">Acesse o painel do estúdio</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-field">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                <input
                  type="email"
                  className="input-dark pl-10"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label-field">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-dark pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-[#E74C3C] bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full justify-center mt-2" disabled={loading}>
              <LogIn size={16} />
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-6 space-y-3">
          <p className="text-[10px] text-[#444] uppercase tracking-widest text-center font-semibold">
            Contas de demonstração
          </p>

          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield size={12} className="text-[#8B5CF6]" />
                <span className="text-[10px] text-[#8B5CF6] uppercase tracking-widest font-bold">Admin — pode editar</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {adminUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => fillDemo(u.email, u.password)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#A78BFA] hover:bg-[#8B5CF6]/20 transition-colors"
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-[#1a1a1a] pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Mic2 size={12} className="text-[#666]" />
                <span className="text-[10px] text-[#666] uppercase tracking-widest font-bold">Artista — só visualiza</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {artistUsers.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => fillDemo(u.email, u.password)}
                    className="text-[11px] px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-[#222] text-[#888] hover:text-[#ccc] hover:border-[#333] transition-colors"
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
