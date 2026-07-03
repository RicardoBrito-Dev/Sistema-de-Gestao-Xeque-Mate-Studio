'use client'

import React, { useEffect, useState } from 'react'
import {
  getFinancialSummary,
  getArtists,
  getClients,
  getKanbanCards,
  getSessions,
} from '@/lib/storage'
import { DollarSign, Mic2, TrendingUp, Sparkles, Users, LayoutDashboard, Music } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import ServicePieChart from '@/components/dashboard/ServicePieChart'
import RecentTransactions from '@/components/dashboard/RecentTransactions'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function DashboardPage() {
  const [summary, setSummary] = useState({
    totalRevenue: 0, monthRevenue: 0, totalExpenses: 0, monthExpenses: 0,
    netProfit: 0, monthNetProfit: 0, revenueGrowth: 0,
  })
  const [artistsCount, setArtistsCount] = useState(0)
  const [clientsCount, setClientsCount] = useState(0)
  const [kanbanCount, setKanbanCount] = useState(0)
  const [sessionsToday, setSessionsToday] = useState(0)
  const [currentDateStr, setCurrentDateStr] = useState('')

  useEffect(() => {
    setSummary(getFinancialSummary())
    setArtistsCount(getArtists().filter(a => a.status === 'ativo').length)
    setClientsCount(getClients().length)
    setKanbanCount(getKanbanCards().filter(k => k.stage !== 'entregue').length)
    const today = format(new Date(), 'yyyy-MM-dd')
    setSessionsToday(getSessions().filter(s => s.date === today).length)
    setCurrentDateStr(format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR }))
  }, [])

  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="flex-1 w-full animate-fade-in">
      <div className="max-w-[1400px] mx-auto pl-6 sm:pl-10 md:pl-16 lg:pl-20 pr-6 sm:pr-8 md:pr-12 lg:pr-14 py-8 md:py-12 space-y-8">

        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 pb-6 border-b border-[#1e1e1e]">
          <p className="text-xs font-semibold text-gold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles size={11} className="animate-float" />
            Painel de Controle
          </p>
          <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">
            Bem-vindo ao{' '}
            <span style={{
              background: 'linear-gradient(135deg, #8B5CF6, #C084FC)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Xeque Mate Studio
            </span>
          </h1>
          <p className="text-sm text-[#666] mt-0.5 capitalize">{currentDateStr}</p>
        </div>

        {/* ─── KPI Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            title="Faturamento Mês"
            value={fmt(summary.monthRevenue)}
            subtitle="entradas no período"
            icon={DollarSign}
            trend={summary.revenueGrowth}
            color="gold"
          />
          <StatCard
            title="Despesas Mês"
            value={fmt(summary.monthExpenses)}
            subtitle="saídas no período"
            icon={TrendingUp}
            color="crimson"
          />
          <StatCard
            title="Resultado Líquido"
            value={fmt(summary.monthNetProfit)}
            subtitle="saldo do mês"
            icon={DollarSign}
            color={summary.monthNetProfit >= 0 ? 'green' : 'crimson'}
          />
          <StatCard
            title="Artistas Ativos"
            value={artistsCount}
            subtitle="na produtora"
            icon={Mic2}
            color="blue"
          />
        </div>

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
              className={`flex flex-col items-center justify-center py-5 px-4 text-center border-r border-b md:border-b-0 border-[#1e1e1e] last:border-r-0 ${i >= 2 ? 'border-b-0' : ''}`}
            >
              <span className="text-[10px] text-[#555] uppercase tracking-widest font-semibold block">
                {item.label}
              </span>
              <span className={`text-xl font-bebas tracking-wide mt-2 block ${item.highlight ? 'text-gold' : 'text-[#F0F0F0]'}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* ─── Charts ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <ServicePieChart />
          </div>
        </div>

        {/* ─── Recent Transactions ─────────────────────────────── */}
        <RecentTransactions />

      </div>
    </div>
  )
}
