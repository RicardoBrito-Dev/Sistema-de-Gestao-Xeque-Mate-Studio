'use client'

import React, { useEffect, useState } from 'react'
import {
  getFinancialSummaryAsync,
  getArtistsAsync,
  getClientsAsync,
  getKanbanCardsAsync,
  getSessionsAsync,
  getTransactionsAsync,
} from '@/lib/storage'
import { DollarSign, Mic2, TrendingUp, Sparkles, Users, Music, Kanban, Calendar, Eye } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import ServicePieChart from '@/components/dashboard/ServicePieChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import { useAuth } from '@/contexts/AuthContext'
import { filterKanbanForUser, filterSessionsForUser, filterTransactionsForUser } from '@/lib/permissions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

export default function DashboardPage() {
  const { user, canEdit } = useAuth()
  const [summary, setSummary] = useState({
    totalRevenue: 0, monthRevenue: 0, totalExpenses: 0, monthExpenses: 0,
    netProfit: 0, monthNetProfit: 0, revenueGrowth: 0,
  })
  const [artistsCount, setArtistsCount] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [kanbanCount, setKanbanCount] = useState(0)
  const [sessionsToday, setSessionsToday] = useState(0)
  const [artistRevenue, setArtistRevenue] = useState(0)
  const [currentDateStr, setCurrentDateStr] = useState('')

  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd')

    const loadData = async () => {
      if (canEdit) {
        const [sum, artists, clients, kanban, sessions] = await Promise.all([
          getFinancialSummaryAsync(),
          getArtistsAsync(),
          getClientsAsync(),
          getKanbanCardsAsync(),
          getSessionsAsync(),
        ])
        setSummary(sum)
        setArtistsCount(artists.filter(a => a.status === 'ativo').length)
        setClientsCount(clients.length)
        setKanbanCount(kanban.filter(k => k.stage !== 'entregue').length)
        setSessionsToday(sessions.filter(s => s.date === today).length)
      } else {
        const [kanban, sessions, txs] = await Promise.all([
          getKanbanCardsAsync(),
          getSessionsAsync(),
          getTransactionsAsync(),
        ])
        const myKanban = filterKanbanForUser(kanban, user)
        const mySessions = filterSessionsForUser(sessions, user)
        const myTransactions = filterTransactionsForUser(txs, user)
        const txRevenue = myTransactions
          .filter(t => t.type === 'receita')
          .reduce((sum, t) => sum + t.amount, 0)
        const sessionRevenue = mySessions
          .filter(s => s.status !== 'cancelado' && s.value)
          .reduce((sum, s) => sum + (s.value || 0), 0)
        const myRevenue = txRevenue > 0 ? txRevenue : sessionRevenue

        setKanbanCount(myKanban.filter(k => k.stage !== 'entregue').length)
        setSessionsToday(mySessions.filter(s => s.date === today).length)
        setArtistRevenue(myRevenue)
      }
    }

    loadData()
    setCurrentDateStr(format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }))
  }, [user, canEdit])

  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="flex-1 w-full animate-fade-in">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 space-y-8">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 pb-6 border-b border-[#1e1e1e]">
          <p className="text-xs font-semibold text-gold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={11} className="animate-float" />
            {canEdit ? 'Painel de Controle' : 'Meu Painel'}
          </p>
          <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">
            {canEdit ? (
              <>
                Bem-vindo ao{' '}
                <span style={{
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  Xeque Mate Studio
                </span>
              </>
            ) : (
              <>Olá, <span className="text-gold">{user?.name}</span></>
            )}
          </h1>
          <p className="text-sm text-[#666] mt-0.5 capitalize">{currentDateStr}</p>
          {!canEdit && (
            <div className="flex items-center gap-2 mt-2">
              <Eye size={12} className="text-[#666]" />
              <span className="text-xs text-[#666]">Modo visualização — você pode acompanhar, mas não editar dados</span>
            </div>
          )}
        </div>

        {canEdit ? (
          <>
            {/* ─── KPI Cards (Admin) ──────────────────────────────────────── */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Faturamento Mês"
                  value={fmt(summary.monthRevenue)}
                  subtitle="entradas no período"
                  icon={DollarSign}
                  trend={summary.revenueGrowth}
                  color="gold"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Despesas Mês"
                  value={fmt(summary.monthExpenses)}
                  subtitle="saídas no período"
                  icon={TrendingUp}
                  color="crimson"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Resultado Líquido"
                  value={fmt(summary.monthNetProfit)}
                  subtitle="saldo do mês"
                  icon={DollarSign}
                  color={summary.monthNetProfit >= 0 ? 'green' : 'crimson'}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Artistas Ativos"
                  value={artistsCount}
                  subtitle="na produtora"
                  icon={Mic2}
                  color="blue"
                />
              </motion.div>
            </motion.div>

            {/* ─── Quick stats bar ────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 rounded-xl border border-[#1e1e1e] bg-[#0f0f0f] overflow-hidden">
              {[
                { label: 'Receita Total', value: fmt(summary.totalRevenue), highlight: true },
                { label: 'Clientes Cadastrados', value: String(clientsCount), highlight: false },
                { label: 'Músicas em Produção', value: String(kanbanCount), highlight: false },
                { label: 'Sessões Hoje', value: String(sessionsToday), highlight: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex flex-col items-center justify-center py-5 px-4 text-center border-[#1e1e1e] min-w-0
                    ${i % 2 === 0 ? 'border-r' : 'border-r-0 md:border-r'} 
                    ${i < 2 ? 'border-b' : 'border-b-0'} 
                    md:border-b-0 
                    md:last:border-r-0`}
                >
                  <span className="text-[10px] text-[#555] uppercase tracking-widest font-semibold block truncate w-full px-1" title={item.label}>
                    {item.label}
                  </span>
                  <span 
                    className={`text-lg sm:text-xl font-bebas tracking-wide mt-2 block truncate w-full px-1 ${item.highlight ? 'text-gold' : 'text-[#F0F0F0]'}`}
                    title={item.value}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* ─── Charts ─────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
              <div className="lg:col-span-2 min-w-0">
                <RevenueChart />
              </div>
              <div className="min-w-0">
                <ServicePieChart />
              </div>
            </div>

            <RecentTransactions />
          </>
        ) : (
          <>
            {/* ─── KPI Cards (Artista) ──────────────────────────────────────── */}
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Minhas Faixas"
                  value={kanbanCount}
                  subtitle="em produção"
                  icon={Kanban}
                  color="gold"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Sessões Hoje"
                  value={sessionsToday}
                  subtitle="agendadas"
                  icon={Calendar}
                  color="blue"
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard
                  title="Meu Faturamento"
                  value={fmt(artistRevenue)}
                  subtitle="receitas registradas"
                  icon={Music}
                  color="green"
                />
              </motion.div>
            </motion.div>

            <motion.div
              className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <h3 className="font-bebas text-lg text-[#F0F0F0] tracking-wider mb-3">Acesso Rápido</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Produção', desc: 'Acompanhe suas faixas no kanban', href: '/kanban', icon: Kanban },
                  { label: 'Agenda', desc: 'Veja suas sessões agendadas', href: '/schedule', icon: Calendar },
                  { label: 'Perfil', desc: 'Suas informações no estúdio', href: '/artists', icon: Mic2 },
                ].map(({ label, desc, href, icon: Icon }) => (
                  <motion.a
                    key={href}
                    href={href}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-[#111] border border-[#1e1e1e] hover:border-[#16a34a]/30 rounded-xl p-4 transition-colors group block"
                  >
                    <Icon size={18} className="text-[#16a34a] mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm font-semibold text-[#F0F0F0]">{label}</p>
                    <p className="text-xs text-[#555] mt-1">{desc}</p>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </>
        )}

      </div>
    </div>
  )
}
