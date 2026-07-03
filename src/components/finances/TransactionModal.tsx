'use client'

import React, { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import { Transaction, TransactionType, TransactionCategory } from '@/lib/types'
import { saveTransaction, generateId } from '@/lib/storage'

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction: Transaction | null
  onSave: () => void
}

export default function TransactionModal({
  isOpen,
  onClose,
  transaction,
  onSave,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('receita')
  const [category, setCategory] = useState<TransactionCategory>('gravacao')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [date, setDate] = useState('')

  useEffect(() => {
    if (transaction) {
      setType(transaction.type)
      setCategory(transaction.category)
      setDescription(transaction.description)
      setAmount(transaction.amount)
      setDate(transaction.date)
    } else {
      setType('receita')
      setCategory('gravacao')
      setDescription('')
      setAmount(0)
      setDate(new Date().toISOString().split('T')[0])
    }
  }, [transaction, isOpen])

  // Change default category when switching types to keep selections valid
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType)
    setCategory(newType === 'receita' ? 'gravacao' : 'equipamento')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!description || !amount || !date) {
      alert('Descrição, Valor e Data são obrigatórios.')
      return
    }

    const payload: Transaction = {
      id: transaction?.id || generateId(),
      type,
      category,
      description,
      amount: Number(amount) || 0,
      date,
      createdAt: transaction?.createdAt || new Date().toISOString(),
    }

    saveTransaction(payload)
    onSave()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Editar Lançamento' : 'Novo Lançamento'} size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Toggle Type button */}
        <div>
          <label className="label-field">Tipo de Lançamento</label>
          <div className="grid grid-cols-2 gap-2 bg-[#0d0d0d] p-1.5 rounded-xl border border-[#1e1e1e]">
            <button
              type="button"
              onClick={() => handleTypeChange('receita')}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                type === 'receita'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-[#555] hover:text-[#888] hover:bg-[#141414]'
              }`}
            >
              ↑ Receita (Entrada)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('despesa')}
              className={`py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 active:scale-[0.97] cursor-pointer ${
                type === 'despesa'
                  ? 'bg-crimson text-white shadow-lg shadow-crimson/20'
                  : 'text-[#555] hover:text-[#888] hover:bg-[#141414]'
              }`}
            >
              ↓ Despesa (Saída)
            </button>
          </div>
        </div>

        {/* Category select */}
        <div>
          <label className="label-field">Categoria</label>
          <select
            className="input-dark"
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
          >
            {type === 'receita' ? (
              <>
                <option value="gravacao">Gravação</option>
                <option value="mix">Mixagem</option>
                <option value="master">Masterização</option>
                <option value="recall">Recall</option>
                <option value="producao">Produção de Beats</option>
                <option value="outro">Outro</option>
              </>
            ) : (
              <>
                <option value="equipamento">Equipamento / Upgrade</option>
                <option value="aluguel">Aluguel / Custos Fixos</option>
                <option value="marketing">Impulsionamentos / Marketing</option>
                <option value="salario">Salário / Ecad / Comissões</option>
                <option value="outro">Outro / Diversos</option>
              </>
            )}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="label-field">Descrição / Lançamento *</label>
          <input
            type="text"
            className="input-dark"
            placeholder="Ex: Sessão Gravação - Pedro"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Amount & Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label-field">Valor (R$) *</label>
            <input
              type="number"
              className="input-dark"
              placeholder="Ex: 500"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              min="0.01"
              step="0.01"
              required
            />
          </div>
          <div>
            <label className="label-field">Data *</label>
            <input
              type="date"
              className="input-dark"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-5 border-t border-[#1e1e1e]">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Confirmar Lançamento
          </button>
        </div>
      </form>
    </Modal>
  )
}
