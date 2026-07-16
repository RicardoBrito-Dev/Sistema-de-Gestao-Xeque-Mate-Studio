'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { registerArtist, updatePasswordByEmail } from '@/lib/auth'
import { Crown, Mail, Lock, LogIn, LogOut, Eye, EyeOff, Camera, Check, ArrowLeft, Key } from 'lucide-react'

export default function LoginPage() {
  const { login, logout, user } = useAuth()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Registration States
  const [artisticName, setArtisticName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [regRole, setRegRole] = useState<'artist' | 'admin'>('artist')

  // Password Change States
  const [changeEmail, setChangeEmail] = useState('')
  const [changeCurrentPassword, setChangeCurrentPassword] = useState('')
  const [changeNewPassword, setChangeNewPassword] = useState('')
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('')
  
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

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
  
  const activePassword = isChangingPassword ? changeNewPassword : regPassword
  const strength = getPasswordStrength(activePassword)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (changeNewPassword.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.')
      setLoading(false)
      return
    }

    if (changeNewPassword !== changeConfirmPassword) {
      setError('As novas senhas não coincidem.')
      setLoading(false)
      return
    }

    try {
      await updatePasswordByEmail(changeEmail, changeCurrentPassword, changeNewPassword)
      setError('Senha alterada com sucesso! Faça login com a nova senha.')
      setIsChangingPassword(false)
      setEmail(changeEmail)
      setPassword('')
      setChangeEmail('')
      setChangeCurrentPassword('')
      setChangeNewPassword('')
      setChangeConfirmPassword('')
    } catch (err: any) {
      setError(err.message || 'Erro ao alterar a senha.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        router.push('/dashboard')
      } else {
        setError('E-mail ou senha incorretos')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login.')
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

    if (regPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.')
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
          {/* Header: abas Login/Cadastro + botões de navegação */}
          <div className="mb-6 pb-4 border-b border-[#1e1e1e]/50">
            {/* Linha superior: abas */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setIsRegistering(false); setIsChangingPassword(false); setError(''); }}
                className={`font-bebas text-xl tracking-wider pb-1 transition-all cursor-pointer ${
                  !isRegistering && !isChangingPassword ? 'text-[#8B5CF6] border-b border-[#8B5CF6]' : 'text-[#555] hover:text-[#888]'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsRegistering(true); setIsChangingPassword(false); setError(''); }}
                className={`font-bebas text-xl tracking-wider pb-1 transition-all cursor-pointer ${
                  isRegistering && !isChangingPassword ? 'text-[#8B5CF6] border-b border-[#8B5CF6]' : 'text-[#555] hover:text-[#888]'
                }`}
              >
                {user && user.role === 'admin' ? 'Cadastrar Usuário' : 'Cadastrar Artista'}
              </button>
            </div>

            {/* Linha inferior: botão contextual de saída/navegação */}
            {user && user.role === 'admin' && (
              // Admin logado criando conta → botão para voltar ao sistema
              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-[#555]">
                  Logado como <span className="text-[#888]">{user.name}</span>
                </span>
                <button
                  onClick={() => { logout(); router.push('/login'); }}
                  className="flex items-center gap-1.5 text-[11px] text-rose-500 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <LogOut size={12} />
                  Sair
                </button>
              </div>
            )}

            {!user && (isRegistering || isChangingPassword) && (
              // Visitante no formulário de cadastro ou alteração → botão para voltar ao login
              <button
                onClick={() => { setIsRegistering(false); setIsChangingPassword(false); setError(''); }}
                className="flex items-center gap-1.5 text-[11px] text-[#555] hover:text-[#888] transition-colors cursor-pointer mt-3"
              >
                <ArrowLeft size={12} />
                Voltar ao login
              </button>
            )}
          </div>

          {isChangingPassword ? (
            /* Change Password Form */
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="label-field">Seu E-mail *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type="email"
                    className="input-dark pl-10 text-sm"
                    placeholder="contato@xequemate.com"
                    value={changeEmail}
                    onChange={e => setChangeEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label-field">Senha Atual *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-dark pl-10 pr-10 text-sm"
                    placeholder="••••••••"
                    value={changeCurrentPassword}
                    onChange={e => setChangeCurrentPassword(e.target.value)}
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

              <div>
                <label className="label-field">Nova Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-dark pl-10 pr-10 text-sm"
                    placeholder="Mínimo 6 caracteres"
                    value={changeNewPassword}
                    onChange={e => setChangeNewPassword(e.target.value)}
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
                {changeNewPassword && (
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

              <div>
                <label className="label-field">Confirmar Nova Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={15} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-dark pl-10 pr-10 text-sm"
                    placeholder="Repita a nova senha"
                    value={changeConfirmPassword}
                    onChange={e => setChangeConfirmPassword(e.target.value)}
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
                <p className={`text-xs px-3 py-2 border rounded-lg ${
                  error.includes('sucesso') 
                    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-[#E74C3C] bg-[#C0392B]/10 border-[#C0392B]/20'
                }`}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary w-full justify-center mt-2 cursor-pointer" disabled={loading}>
                <Key size={15} />
                {loading ? 'Alterando...' : 'Confirmar Alteração de Senha'}
              </button>
            </form>
          ) : !isRegistering ? (
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setIsChangingPassword(true); setIsRegistering(false); setError(''); }}
                  className="text-xs text-[#8B5CF6] hover:text-[#A78BFA] transition-colors cursor-pointer animate-fade-in"
                >
                  Alterar minha senha?
                </button>
              </div>

              {error && (
                <p className={`text-xs px-3 py-2 border rounded-lg ${
                  error.includes('bloqueado') || error.includes('tentativas') || error.includes('Aguarde')
                    ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    : 'text-[#E74C3C] bg-[#C0392B]/10 border-[#C0392B]/20'
                }`}>
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

              {/* Password strength UI and field layout */}
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
                {regPassword && (
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
