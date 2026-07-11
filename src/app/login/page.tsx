'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { registerArtist } from '@/lib/auth'
import { Crown, Mail, Lock, LogIn, Eye, EyeOff, Camera, Check } from 'lucide-react'

export default function LoginPage() {
  const { login, user } = useAuth()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Registration States
  const [artisticName, setArtisticName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [regRole, setRegRole] = useState<'artist' | 'admin'>('artist')
  
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const success = await login(email, password)
    if (success) {
      router.push('/dashboard')
    } else {
      setError('E-mail ou senha incorretos')
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!artisticName || !regEmail || !regPassword) {
      setError('Preencha os campos obrigatórios (*).')
      setLoading(false)
      return
    }

    try {
      await registerArtist({
        artisticName,
        email: regEmail,
        password: regPassword,
        avatarUrl: avatarUrl || undefined,
        role: user && user.role === 'admin' ? regRole : 'artist',
        approved: user && user.role === 'admin' ? true : false,
      })

      // If the registrar is NOT an admin, show approval pending message (do NOT auto-login)
      if (!user || user.role !== 'admin') {
        setError('Aguarde a aprovação de um administrador para poder acessar.')
        setIsRegistering(false)
        setEmail(regEmail)
        setPassword('')
        setArtisticName('')
        setRegEmail('')
        setRegPassword('')
        setAvatarUrl('')
        setLoading(false)
      } else {
        // If the registrar IS an admin, show success message and clear form fields (keep admin logged in)
        setError('Novo usuário cadastrado com sucesso!')
        setArtisticName('')
        setRegEmail('')
        setRegPassword('')
        setAvatarUrl('')
        setRegRole('artist')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar cadastro.')
      setLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('A foto deve ter no máximo 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const avatarPresets = [
    { name: 'Mic Vintage', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150&h=150&fit=crop' },
    { name: 'Studio', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=150&h=150&fit=crop' },
    { name: 'Headphones', url: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb1?w=150&h=150&fit=crop' },
    { name: 'Neon Show', url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=150&h=150&fit=crop' },
  ]

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#060606] px-4 py-8 sm:py-12">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center animate-pulse-gold mb-3">
            <Crown size={28} className="text-[#8B5CF6]" />
          </div>
          <h1
            className="font-bebas text-3xl md:text-4xl tracking-widest leading-none"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Xeque Mate
          </h1>
          <p className="text-[10px] text-[#444] tracking-[0.25em] uppercase mt-1.5">Studio Management</p>
        </div>

        {/* Card */}
        <div className="bg-[#111] border border-[#1e1e1e] rounded-2xl p-6 sm:p-8 shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1e1e1e]/50">
            <button
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`font-bebas text-xl tracking-wider pb-1 transition-all cursor-pointer ${
                !isRegistering ? 'text-[#8B5CF6] border-b border-[#8B5CF6]' : 'text-[#555] hover:text-[#888]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`font-bebas text-xl tracking-wider pb-1 transition-all cursor-pointer ${
                isRegistering ? 'text-[#8B5CF6] border-b border-[#8B5CF6]' : 'text-[#555] hover:text-[#888]'
              }`}
            >
              {user && user.role === 'admin' ? 'Cadastrar Usuário' : 'Cadastrar Artista'}
            </button>
          </div>

          {!isRegistering ? (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-field">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type="email"
                    className="input-dark pl-10 text-sm"
                    placeholder="contato@xequemate.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-dark pl-10 pr-10 text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-[#E74C3C] bg-[#C0392B]/10 border border-[#C0392B]/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full justify-center mt-2 cursor-pointer" disabled={loading}>
                <LogIn size={15} />
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label-field">Nome Artístico ou Nome Completo *</label>
                <input
                  type="text"
                  className="input-dark text-sm"
                  placeholder="Ex: MC Sombra ou Lucas Ferreira"
                  value={artisticName}
                  onChange={e => setArtisticName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label-field">E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type="email"
                    className="input-dark pl-10 text-sm"
                    placeholder="contato@xequemate.com"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-dark pl-10 pr-10 text-sm"
                    placeholder="Mínimo 6 caracteres"
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#888] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Conditional Role Selector (Admin only) */}
              {user && user.role === 'admin' && (
                <div>
                  <label className="label-field">Função da Conta *</label>
                  <select
                    value={regRole}
                    onChange={e => setRegRole(e.target.value as 'artist' | 'admin')}
                    className="input-dark text-xs"
                  >
                    <option value="artist">Artista (Apenas agenda própria)</option>
                    <option value="admin">Administrador (Controle total)</option>
                  </select>
                </div>
              )}

              {/* Avatar Selector */}
              <div>
                <label className="label-field">Foto de Perfil</label>
                <div className="flex flex-col gap-3">
                  {/* Selected Preview */}
                  <div className="flex items-center gap-3">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar Preview"
                        className="w-12 h-12 rounded-full object-cover border border-[#8B5CF6]"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1e1e1e] border border-[#2a2a2a] flex items-center justify-center text-[#555]">
                        <Camera size={18} />
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#555] uppercase tracking-wider">Foto do casting</span>
                      <span className="text-xs text-[#888]">Escolha abaixo ou envie uma foto</span>
                    </div>
                  </div>

                  {/* Preset list */}
                  <div className="flex items-center gap-2">
                    {avatarPresets.map((preset, idx) => {
                      const selected = avatarUrl === preset.url
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatarUrl(preset.url)}
                          className={`w-9 h-9 rounded-full overflow-hidden border-2 relative transition-all cursor-pointer ${
                            selected ? 'border-[#8B5CF6] scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                          title={preset.name}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          {selected && (
                            <div className="absolute inset-0 bg-[#8B5CF6]/30 flex items-center justify-center text-white">
                              <Check size={10} strokeWidth={4} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                    
                    {/* File upload button */}
                    <label className="w-9 h-9 rounded-full border border-dashed border-[#3a3a3a] hover:border-[#8B5CF6] flex items-center justify-center cursor-pointer transition-colors text-[#555] hover:text-[#A78BFA]">
                      <Camera size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {error && (
                <p className={`text-xs px-3 py-2 border rounded-lg ${
                  error.includes('Aguarde') || error.includes('aprovação')
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : error.includes('sucesso') 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-[#E74C3C] bg-[#C0392B]/10 border-[#C0392B]/20'
                }`}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full justify-center mt-2 cursor-pointer" disabled={loading}>
                <LogIn size={15} />
                {loading ? 'Cadastrando...' : (user && user.role === 'admin' ? 'Cadastrar Novo Usuário' : 'Cadastrar e Entrar')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
