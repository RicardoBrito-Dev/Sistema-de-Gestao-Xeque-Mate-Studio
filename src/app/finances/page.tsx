'use client'

import React, { useEffect, useState } from 'react'
import {
  getTransactionsAsync, deleteTransaction, getFinancialSummaryAsync, getRevenueByMonthAsync
} from '@/lib/storage'
import { Transaction } from '@/lib/types'
import TransactionModal from '@/components/finances/TransactionModal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import {
  TrendingUp, TrendingDown, DollarSign, Plus, Trash2, Search,
  Mic2, Sliders, Headphones, RotateCcw, Music, Settings, Home,
  Megaphone, User, MoreHorizontal, Calendar, ArrowUpRight, ArrowDownRight,
  Share2, Check
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

const catIcons: Record<string, any> = {
  gravacao: Mic2, mix: Sliders, master: Headphones, recall: RotateCcw,
  producao: Music, equipamento: Settings, aluguel: Home,
  marketing: Megaphone, salario: User, outro: MoreHorizontal,
}
const catLabels: Record<string, string> = {
  gravacao: 'Gravação', mix: 'Mixagem', master: 'Masterização', recall: 'Recall',
  producao: 'Produção', equipamento: 'Equipamento', aluguel: 'Aluguel',
  marketing: 'Marketing', salario: 'Salário', outro: 'Outro',
}

export default function FinancesPage() {
  const { canEdit } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState({ totalRevenue: 0, monthRevenue: 0, totalExpenses: 0, monthExpenses: 0, netProfit: 0, monthNetProfit: 0, revenueGrowth: 0 })
  const [chartData, setChartData] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'receita' | 'despesa'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [monthFilter, setMonthFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const loadData = async () => {
    const [txs, sum, chart] = await Promise.all([
      getTransactionsAsync(),
      getFinancialSummaryAsync(),
      getRevenueByMonthAsync()
    ])
    setTransactions(txs)
    setSummary(sum)
    setChartData(chart)
  }

  useEffect(() => { loadData() }, [])

  const handleDelete = (id: string, desc: string) => {
    if (confirm(`Excluir lançamento "${desc}"?`)) {
      setTransactions(prev => prev.filter(tx => tx.id !== id))
      deleteTransaction(id)
      loadData() // atualiza summary e chart em background
    }
  }

  const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.description.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || tx.type === typeFilter
    const matchCat = categoryFilter === 'all' || tx.category === categoryFilter
    let matchMonth = true
    if (monthFilter) {
      const [y, m] = monthFilter.split('-')
      const d = new Date(tx.date)
      matchMonth = d.getFullYear() === parseInt(y) && (d.getMonth() + 1) === parseInt(m)
    }
    return matchSearch && matchType && matchCat && matchMonth
  })

  // Group by date
  const grouped: Record<string, Transaction[]> = {}
  filtered.forEach(tx => {
    if (!grouped[tx.date]) grouped[tx.date] = []
    grouped[tx.date].push(tx)
  })
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const dayHeader = (dateStr: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
    if (dateStr === today) return 'Hoje'
    if (dateStr === yesterday) return 'Ontem'
    return format(new Date(dateStr + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const [copiedFinances, setCopiedFinances] = useState(false)

  const handleShareFinancialSummary = () => {
    const monthName = format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })

    let text = `💰 *XEQUE MATE STUDIO — FECHAMENTO FINANCEIRO*\n`
    text += `📅 *Período: ${monthName.toUpperCase()}*\n`
    text += `━━━━━━━━━━━━━━━━━━━━━\n`
    text += `📈 *Receita do Mês:* ${fmt(summary.monthRevenue)}\n`
    text += `💵 *Receita Total:* ${fmt(summary.totalRevenue)}\n`
    text += `📉 *Despesas Total:* ${fmt(summary.totalExpenses)}\n`
    text += `💎 *Lucro Líquido:* ${fmt(summary.netProfit)}\n`
    text += `━━━━━━━━━━━━━━━━━━━━━\n`
    text += `_Gerado via Xeque Mate Studio OS_`

    navigator.clipboard.writeText(text)
    setCopiedFinances(true)
    setTimeout(() => setCopiedFinances(false), 3000)
  }

  return (
    <div className="flex-1 w-full animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-8">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1e1e1e]">
          <div>
            <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">Fluxo Financeiro</h1>
            <p className="text-sm text-[#888] mt-1.5">Controle de receitas e despesas da produtora</p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleShareFinancialSummary}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141417] hover:bg-[#1a1a1e] border border-[#27272a] text-xs font-semibold text-[#d4d4d8] hover:text-white transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Copiar resumo financeiro para enviar aos sócios no WhatsApp"
            >
              {copiedFinances ? (
                <>
                  <Check size={14} className="text-[#22c55e]" />
                  <span className="text-[#4ade80]">Copiado para WhatsApp!</span>
                </>
              ) : (
                <>
                  <Share2 size={14} className="text-[#22c55e]" />
                  <span>Resumo para WhatsApp</span>
                </>
              )}
            </button>
            {canEdit && (
              <Button onClick={() => setIsModalOpen(true)} variant="default" size="default">
                <Plus size={16} />Novo Lançamento
              </Button>
            )}
          </div>
        </div>

        {/* ─── KPI Cards ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { label: 'Receita Total', value: fmt(summary.totalRevenue), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
            { label: 'Despesas Total', value: fmt(summary.totalExpenses), icon: TrendingDown, color: 'text-[#E74C3C]', bg: 'bg-[#C0392B]/10', border: 'border-[#C0392B]/20' },
            { label: 'Lucro Líquido', value: fmt(summary.netProfit), icon: DollarSign, color: summary.netProfit >= 0 ? 'text-gold' : 'text-[#E74C3C]', bg: 'bg-gold/10', border: 'border-gold/20' },
            { label: 'Receita do Mês', value: fmt(summary.monthRevenue), icon: Calendar, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
          ].map(({ label, value, icon: Icon, color, bg, border }, i) => (
            <div key={i} className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] text-[#555] uppercase tracking-widest font-semibold">{label}</span>
                <div className={`p-2 rounded-lg ${bg} border ${border}`}>
                  <Icon size={14} className={color} />
                </div>
              </div>
              <span className={`text-xl md:text-2xl font-bebas tracking-wide ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        {/* ─── Mini chart ─── */}
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-5">
          <p className="text-xs text-[#555] uppercase tracking-widest font-semibold mb-4">Fluxo Semestral</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ left: -30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                <XAxis dataKey="month" stroke="#333" tickLine={false} tick={{ fill: '#555', fontSize: 11 }} />
                <YAxis stroke="#333" tickLine={false} tick={{ fill: '#555', fontSize: 11 }} tickFormatter={v => `R$${v}`} />
                <Bar dataKey="receita" name="Receitas" fill="#16a34a" radius={[3, 3, 0, 0]} maxBarSize={24} />
                <Bar dataKey="despesa" name="Despesas" fill="#C0392B" radius={[3, 3, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── Filters ─── */}
        <div className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl p-4 grid grid-cols-1 sm:flex sm:flex-wrap gap-4 items-center">
          <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#444]" size={14} />
            <input type="text" className="input-dark pl-9 text-sm" placeholder="Buscar descrição..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <Tabs
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as 'all' | 'receita' | 'despesa')}
            className="w-full sm:w-auto"
          >
            <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:flex">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="receita">Entradas</TabsTrigger>
              <TabsTrigger value="despesa">Saídas</TabsTrigger>
            </TabsList>
          </Tabs>

          <select className="input-dark text-sm w-full sm:w-auto sm:min-w-[180px]" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">Todas Categorias</option>
            <optgroup label="Receitas">
              {['gravacao', 'mix', 'master', 'recall', 'producao'].map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
            </optgroup>
            <optgroup label="Despesas">
              {['equipamento', 'aluguel', 'marketing', 'salario'].map(c => <option key={c} value={c}>{catLabels[c]}</option>)}
            </optgroup>
            <option value="outro">Outro</option>
          </select>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input type="month" className="input-dark text-sm w-full sm:w-auto sm:max-w-[160px]" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
            {monthFilter && (
              <button onClick={() => setMonthFilter('')} className="text-xs text-[#555] hover:text-[#888] underline whitespace-nowrap">Limpar</button>
            )}
          </div>
        </div>

        {/* ─── Transaction list ─── */}
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {sortedDates.length === 0 ? (
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-20 border border-dashed border-[#222] rounded-2xl">
              <DollarSign size={32} className="text-[#333] mb-2 animate-float" />
              <p className="text-sm text-[#555]">Nenhum lançamento encontrado.</p>
            </motion.div>
          ) : (
            sortedDates.map(dateStr => (
              <motion.div key={dateStr} variants={itemVariants}>
                <h3 className="text-[11px] text-[#444] uppercase tracking-widest font-semibold mb-3 pl-1">
                  {dayHeader(dateStr)}
                </h3>
                <div className="space-y-2">
                  {grouped[dateStr].map(tx => {
                    const Icon = catIcons[tx.category] || MoreHorizontal
                    const isIn = tx.type === 'receita'
                    return (
                      <motion.div
                        key={tx.id}
                        variants={itemVariants}
                        whileHover={{ x: 2 }}
                        className="bg-[#0f0f0f] border border-[#1e1e1e] hover:border-[#2a2a2a] rounded-xl px-4 py-3.5 flex items-center justify-between gap-4 group transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${isIn ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#C0392B]/10 text-[#E74C3C]'}`}>
                            <Icon size={14} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#F0F0F0] truncate">{tx.description}</p>
                            <span className="text-[10px] text-[#444] uppercase tracking-widest">{catLabels[tx.category] || tx.category}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            {isIn ? <ArrowUpRight size={14} className="text-emerald-400" /> : <ArrowDownRight size={14} className="text-[#E74C3C]" />}
                            <span className={`text-sm font-bold ${isIn ? 'text-emerald-400' : 'text-[#E74C3C]'}`}>
                              {fmt(tx.amount)}
                            </span>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleDelete(tx.id, tx.description)}
                              className="btn-icon btn-icon-danger opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>

      {canEdit && (
        <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} transaction={null} onSave={loadData} />
      )}
    </div>
  )
}
