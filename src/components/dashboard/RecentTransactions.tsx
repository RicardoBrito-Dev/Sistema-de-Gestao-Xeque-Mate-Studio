'use client'

import React, { useEffect, useState } from 'react'
import { getTransactions } from '@/lib/storage'
import { Transaction } from '@/lib/types'
import { ArrowUpRight, ArrowDownRight, Mic2, Sliders, Headphones, RotateCcw, Music, Settings, Home, Megaphone, User, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function RecentTransactions() {
  const [list, setList] = useState<Transaction[]>([])

  useEffect(() => {
    setList(getTransactions().slice(0, 5))
  }, [])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val)
  }

  const categoryIcons: Record<string, any> = {
    gravacao: Mic2,
    mix: Sliders,
    master: Headphones,
    recall: RotateCcw,
    producao: Music,
    equipamento: Settings,
    aluguel: Home,
    marketing: Megaphone,
    salario: User,
    outro: MoreHorizontal,
  }

  const categoryLabels: Record<string, string> = {
    gravacao: 'Gravação',
    mix: 'Mixagem',
    master: 'Masterização',
    recall: 'Recall',
    producao: 'Produção',
    equipamento: 'Equipamento',
    aluguel: 'Aluguel',
    marketing: 'Marketing',
    salario: 'Salário',
    outro: 'Outro',
  }

  return (
    <div className="glass rounded-xl p-5 border border-studio-border shadow-gold/5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bebas text-lg text-studio-text tracking-wider">Últimas Transações</h3>
          <p className="text-xs text-studio-muted">Lançamentos mais recentes</p>
        </div>
      </div>

      <div className="space-y-3">
        {list.length === 0 ? (
          <div className="text-center py-6 text-sm text-studio-muted">
            Nenhuma transação lançada.
          </div>
        ) : (
          list.map((tx) => {
            const Icon = categoryIcons[tx.category] || MoreHorizontal
            const isReceita = tx.type === 'receita'
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg bg-[#141414] hover:bg-[#1a1a1a] transition-colors border border-studio-border min-w-0 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${isReceita ? 'bg-emerald-500/10 text-emerald-400' : 'bg-crimson/10 text-crimson-light'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-studio-text truncate" title={tx.description}>{tx.description}</h4>
                    <span className="text-[10px] text-studio-muted uppercase tracking-wider block truncate">
                      {categoryLabels[tx.category] || tx.category} • {format(new Date(tx.date), 'dd MMM yyyy', { locale: ptBR })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className={`text-sm font-semibold ${isReceita ? 'text-emerald-400' : 'text-crimson-light'}`}>
                    {isReceita ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  {isReceita ? (
                    <ArrowUpRight size={14} className="text-emerald-400" />
                  ) : (
                    <ArrowDownRight size={14} className="text-crimson-light" />
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
