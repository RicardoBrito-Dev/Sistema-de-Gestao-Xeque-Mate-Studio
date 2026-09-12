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
import { Shield, Trash2, User, AlertCircle, Check, X, ShieldAlert } from 'lucide-react'

interface UsersModalProps {
  isOpen: boolean
  onClose: () => void
}

// Estado do painel de confirmação inline
type ConfirmState =
  | { type: 'role'; userId: string; newRole: 'admin' | 'artist'; userName: string }
  | { type: 'delete'; userId: string; userName: string }
  | null

export default function UsersModal({ isOpen, onClose }: UsersModalProps) {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [confirm, setConfirm] = useState<ConfirmState>(null)

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
      setConfirm(null)
    }
  }, [isOpen])

  // ── Aprovar cadastro pendente ───────────────────────────────
  const handleApprove = (u: AppUser) => {
    setErrorMsg('')
    const updatedUser: AppUser = { ...u, approved: true }
    try {
      saveUser(updatedUser)
      setUsers(prev => prev.map(item => item.id === u.id ? updatedUser : item))
    } catch (err: any) {
      setErrorMsg('Erro ao aprovar usuário: ' + err.message)
    }
  }

  // ── Solicita confirmação para mudar papel ──────────────────
  const requestToggleRole = (u: AppUser) => {
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
    setConfirm({ type: 'role', userId: u.id, newRole, userName: u.name })
  }

  // ── Solicita confirmação para excluir ──────────────────────
  const requestDelete = (u: AppUser) => {
    setErrorMsg('')
    if (u.id === 'u1') {
      setErrorMsg('Não é possível excluir o administrador master.')
      return
    }
    if (u.id === currentUser?.userId) {
      setErrorMsg('Você não pode excluir sua própria conta enquanto estiver conectado.')
      return
    }
    setConfirm({ type: 'delete', userId: u.id, userName: u.name })
  }

  // ── Executa ação confirmada ────────────────────────────────
  const handleConfirm = () => {
    if (!confirm) return
    try {
      if (confirm.type === 'role') {
        const u = users.find(x => x.id === confirm.userId)
        if (u) {
          const updatedUser: AppUser = { ...u, role: confirm.newRole }
          saveUser(updatedUser)
          setUsers(prev => prev.map(item => item.id === u.id ? updatedUser : item))
        }
      } else if (confirm.type === 'delete') {
        deleteUser(confirm.userId)
        setUsers(prev => prev.filter(u => u.id !== confirm.userId))
      }
    } catch (err: any) {
      setErrorMsg('Erro ao executar ação: ' + err.message)
    } finally {
      setConfirm(null)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Contas de Acesso" size="md">
      <div className="space-y-4">
        <p className="text-xs text-[#666] leading-relaxed">
          Aprove novos cadastros pendentes para permitir o acesso. Atribua <strong className="text-[#888]">Administrador</strong> para controle total do estúdio, ou <strong className="text-[#888]">Artista</strong> para acesso exclusivo à própria agenda.
        </p>

        {/* ── Painel de confirmação inline ── */}
        {confirm && (
          <div className={`rounded-xl border p-4 space-y-3 ${
            confirm.type === 'delete'
              ? 'bg-rose-950/20 border-rose-500/20'
              : confirm.newRole === 'admin'
              ? 'bg-[#16a34a]/10 border-[#16a34a]/20'
              : 'bg-[#161618] border-[#2a2a2c]'
          }`}>
            <div className="flex items-start gap-2">
              {confirm.type === 'delete' ? (
                <Trash2 size={15} className="text-rose-400 shrink-0 mt-0.5" />
              ) : confirm.newRole === 'admin' ? (
                <ShieldAlert size={15} className="text-[#4ade80] shrink-0 mt-0.5" />
              ) : (
                <User size={15} className="text-[#888] shrink-0 mt-0.5" />
              )}
              <p className="text-xs text-[#CCC] leading-relaxed">
                {confirm.type === 'delete' ? (
                  <>Tem certeza que deseja <span className="text-rose-400 font-semibold">excluir</span> a conta de <span className="text-white font-semibold">"{confirm.userName}"</span>? Esta ação não pode ser desfeita.</>
                ) : confirm.newRole === 'admin' ? (
                  <>Tem certeza que deseja tornar <span className="text-white font-semibold">"{confirm.userName}"</span> um <span className="text-[#4ade80] font-semibold">Administrador</span>? Ele terá acesso total ao estúdio, clientes e financeiro.</>
                ) : (
                  <>Tem certeza que deseja rebaixar <span className="text-white font-semibold">"{confirm.userName}"</span> para <span className="text-[#888] font-semibold">Artista</span>? Ele perderá o acesso administrativo.</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setConfirm(null)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#2a2a2c] text-[#666] hover:text-[#999] hover:border-[#333] transition-all cursor-pointer"
              >
                <X size={12} />
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  confirm.type === 'delete'
                    ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:bg-rose-500/30'
                    : confirm.newRole === 'admin'
                    ? 'bg-[#16a34a]/20 border border-[#16a34a]/30 text-[#4ade80] hover:bg-[#16a34a]/30'
                    : 'bg-[#1e1e1e] border border-[#333] text-[#999] hover:bg-[#252525]'
                }`}
              >
                <Check size={12} />
                Confirmar
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs rounded-lg p-3">
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
              // Linha bloqueada enquanto aguarda confirmação de outra ação
              const isBeingActedOn = confirm?.userId === u.id

              return (
                <div
                  key={u.id}
                  className={`py-3 flex items-center justify-between gap-4 transition-opacity ${
                    isBeingActedOn ? 'opacity-40 pointer-events-none' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#F0F0F0] truncate">{u.name}</span>
                      {isSelf && (
                        <span className="text-[9px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          Você
                        </span>
                      )}
                      {isMaster && (
                        <span className="text-[9px] bg-[#16a34a]/10 border border-[#16a34a]/20 text-[#4ade80] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
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
                      /* Botão de alternância de Role — abre confirmação */
                      <button
                        onClick={() => requestToggleRole(u)}
                        disabled={isMaster || isSelf}
                        className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all flex items-center gap-1.5 ${
                          isMaster || isSelf ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:brightness-125'
                        } ${
                          u.role === 'admin'
                            ? 'bg-[#16a34a]/10 border-[#16a34a]/30 text-[#4ade80]'
                            : 'bg-[#161618] border-[#2a2a2c] text-[#888]'
                        }`}
                      >
                        {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        {u.role === 'admin' ? 'Admin' : 'Artista'}
                      </button>
                    )}

                    {/* Botão de Exclusão — abre confirmação */}
                    <button
                      onClick={() => requestDelete(u)}
                      disabled={isMaster || isSelf}
                      className={`p-2 rounded-lg border transition-all ${
                        isMaster || isSelf
                          ? 'border-[#1a1a1c] text-[#222] cursor-not-allowed opacity-20'
                          : 'border-rose-950/40 hover:bg-rose-950/20 text-rose-500 hover:text-rose-400 cursor-pointer'
                      }`}
                      title={isPending ? 'Recusar Cadastro' : 'Excluir Conta'}
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
