'use client'

// ============================================================
// Modal: gerenciamento de contas de acesso (usuários)
// Apenas administradores podem acessar.
// Permite aprovar cadastros pendentes, mudar papéis e excluir contas.
// ============================================================

import React, { useEffect, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { AppUser } from '@/lib/types'
import { getUsersAsync, saveUser, deleteUser } from '@/lib/storage'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, Trash2, User, AlertCircle, Check } from 'lucide-react'

interface UsersModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UsersModal({ isOpen, onClose }: UsersModalProps) {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadUsers = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const list = await getUsersAsync()
      setUsers(list)
    } catch (err: any) {
      setErrorMsg('Erro ao carregar usuários: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadUsers()
    }
  }, [isOpen])

  const handleApprove = (u: AppUser) => {
    setErrorMsg('')
    const updatedUser: AppUser = { ...u, approved: true }
    try {
      saveUser(updatedUser)
      // Atualiza o estado local instantaneamente
      setUsers(prev => prev.map(item => item.id === u.id ? updatedUser : item))
    } catch (err: any) {
      setErrorMsg('Erro ao aprovar usuário: ' + err.message)
    }
  }

  const handleToggleRole = (u: AppUser) => {
    setErrorMsg('')
    if (u.id === 'u1' || u.email === 'admin@xequemate.com') {
      setErrorMsg('Não é possível alterar a função do administrador master.')
      return
    }
    if (u.id === currentUser?.userId) {
      setErrorMsg('Você não pode alterar sua própria função.')
      return
    }

    const newRole: 'admin' | 'artist' = u.role === 'admin' ? 'artist' : 'admin'
    const updatedUser: AppUser = { ...u, role: newRole }
    
    try {
      saveUser(updatedUser)
      setUsers(prev => prev.map(item => item.id === u.id ? updatedUser : item))
    } catch (err: any) {
      setErrorMsg('Erro ao salvar alteração: ' + err.message)
    }
  }

  const handleDelete = (id: string, name: string) => {
    setErrorMsg('')
    if (id === 'u1') {
      setErrorMsg('Não é possível excluir o administrador master.')
      return
    }
    if (id === currentUser?.userId) {
      setErrorMsg('Você não pode excluir sua própria conta enquanto estiver conectado.')
      return
    }

    if (confirm(`Tem certeza de que deseja excluir a conta de login de "${name}"?`)) {
      try {
        deleteUser(id)
        setUsers(prev => prev.filter(u => u.id !== id))
      } catch (err: any) {
        setErrorMsg('Erro ao excluir usuário: ' + err.message)
      }
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Contas de Acesso" size="md">
      <div className="space-y-4">
        <p className="text-xs text-[#666] leading-relaxed">
          Aprove novos cadastros pendentes para permitir o acesso. Atribua **Administrador** para controle total do estúdio e relatórios, ou **Artista** para acesso exclusivo à própria agenda.
        </p>

        {errorMsg && (
          <div className="flex items-start gap-2 bg-crimson-muted border border-crimson/20 text-crimson-light text-xs rounded-lg p-3">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-[#444] animate-pulse">
            Carregando usuários...
          </div>
        ) : (
          <div className="divide-y divide-[#18181b] max-h-[350px] overflow-y-auto pr-1">
            {users.map(u => {
              const isMaster = u.id === 'u1' || u.email === 'admin@xequemate.com'
              const isSelf = u.id === currentUser?.userId
              const isPending = !isMaster && u.role !== 'admin' && !u.approved

              return (
                <div key={u.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#F0F0F0] truncate">{u.name}</span>
                      {isSelf && (
                        <span className="text-[9px] bg-gold/10 border border-gold/20 text-gold px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Você
                        </span>
                      )}
                      {isMaster && (
                        <span className="text-[9px] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#A78BFA] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Master
                        </span>
                      )}
                      {isPending && (
                        <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Pendente
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#555] block truncate mt-0.5">{u.email}</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPending ? (
                      /* Botão para Aprovar */
                      <button
                        onClick={() => handleApprove(u)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Check size={12} />
                        Aprovar
                      </button>
                    ) : (
                      /* Botão de alternância de Role */
                      <button
                        onClick={() => handleToggleRole(u)}
                        disabled={isMaster || isSelf}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all flex items-center gap-1.5 ${
                          isMaster || isSelf ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:brightness-110'
                        } ${
                          u.role === 'admin'
                            ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-[#A78BFA]'
                            : 'bg-[#161618] border-[#2a2a2c] text-[#888]'
                        }`}
                      >
                        {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        {u.role === 'admin' ? 'Admin' : 'Artista'}
                      </button>
                    )}

                    {/* Botão de Exclusão */}
                    <button
                      onClick={() => handleDelete(u.id, u.name)}
                      disabled={isMaster || isSelf}
                      className={`p-2 rounded-lg border transition-all ${
                        isMaster || isSelf
                          ? 'border-[#1a1a1c] text-[#222] cursor-not-allowed opacity-20'
                          : 'border-rose-950/40 hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 cursor-pointer'
                      }`}
                      title={isPending ? "Recusar Cadastro" : "Excluir Conta"}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}
            {users.length === 0 && (
              <p className="text-xs text-[#444] text-center py-6">Nenhum usuário cadastrado.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
