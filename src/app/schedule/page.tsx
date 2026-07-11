'use client'

import React, { useEffect, useState } from 'react'
import { getSessions, deleteSession } from '@/lib/storage'
import { Session } from '@/lib/types'
import SessionModal from '@/components/schedule/SessionModal'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/contexts/AuthContext'
import { filterSessionsForUser } from '@/lib/permissions'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Plus, Trash2, Clock, User,
} from 'lucide-react'
import {
  format, startOfWeek, endOfWeek, eachDayOfInterval,
  isSameDay, addWeeks, subWeeks, parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function SchedulePage() {
  const { user, canEdit } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [targetDateStr, setTargetDateStr] = useState('')

  const loadData = () => setSessions(filterSessionsForUser(getSessions(), user))
  useEffect(() => { loadData() }, [user])

  const weekStart = startOfWeek(currentWeekStart, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const handleNewSession = (defaultDateStr?: string) => {
    setSelectedSession(null)
    setTargetDateStr(defaultDateStr || new Date().toISOString().split('T')[0])
    setIsModalOpen(true)
  }
  const handleEditSession = (session: Session) => { setSelectedSession(session); setIsModalOpen(true) }
  const handleDeleteSession = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation()
    if (confirm(`Remover "${title}"?`)) { deleteSession(id); loadData() }
  }

  const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val)

  const serviceColors: Record<Session['serviceType'], string> = {
    gravacao: 'border-[#C0392B]/30 text-[#E74C3C]',
    mix: 'border-gold/30 text-gold',
    master: 'border-purple-500/30 text-purple-400',
    recall: 'border-sky-500/30 text-sky-400',
    producao: 'border-emerald-500/30 text-emerald-400',
    outro: 'border-[#222] text-[#888]',
  }
  const serviceLabels: Record<Session['serviceType'], string> = {
    gravacao: 'Gravação', mix: 'Mixagem', master: 'Master',
    recall: 'Recall', producao: 'Beat/Prod', outro: 'Outro',
  }
  const statusDots: Record<Session['status'], string> = {
    confirmado: 'bg-emerald-400 shadow-[0_0_6px_#10b981]',
    pendente: 'bg-amber-400 shadow-[0_0_6px_#f59e0b]',
    cancelado: 'bg-rose-500',
    concluido: 'bg-[#555]',
  }

  const upcomingSessions = sessions
    .filter(s => { const d = new Date(s.date); d.setHours(0, 0, 0, 0); const t = new Date(); t.setHours(0, 0, 0, 0); return d >= t && s.status !== 'cancelado' })
    .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
    .slice(0, 6)

  return (
    <div className="flex-1 w-full animate-fade-in">
      <div className="max-w-[1400px] mx-auto pl-6 sm:pl-10 md:pl-16 lg:pl-20 pr-6 sm:pr-8 md:pr-12 lg:pr-14 py-8 md:py-12 space-y-6">

        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#1e1e1e]">
          <div>
            <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">Agenda do Estúdio</h1>
            <p className="text-sm text-[#888] mt-1.5">
              {canEdit ? 'Controle de gravações, mixagem e sessões agendadas' : 'Suas sessões agendadas no estúdio'}
            </p>
          </div>
          {canEdit && (
            <button onClick={() => handleNewSession()} className="btn-primary">
              <Plus size={16} />Agendar Sessão
            </button>
          )}
        </div>

        {/* ─── Week nav ─── */}
        <div className="flex items-center justify-between bg-[#0d0d0d] border border-[#1e1e1e] rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              className="p-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#1e1e1e] text-[#888] hover:text-[#F0F0F0] transition-all"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => setCurrentWeekStart(new Date())}
              className="px-3 py-1.5 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#1e1e1e] text-xs font-semibold text-[#F0F0F0] transition-all"
            >
              Hoje
            </button>
            <button
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              className="p-2 rounded-lg bg-[#111] hover:bg-[#1a1a1a] border border-[#1e1e1e] text-[#888] hover:text-[#F0F0F0] transition-all"
            >
              <ChevronRight size={15} />
            </button>
          </div>
          <span className="font-bebas text-base tracking-wider text-[#F0F0F0] hidden sm:block">
            {format(weekStart, "dd 'de' MMMM", { locale: ptBR })} — {format(weekEnd, "dd 'de' MMMM, yyyy", { locale: ptBR })}
          </span>
          <span className="font-bebas text-sm tracking-wider text-[#F0F0F0] sm:hidden">
            {format(weekStart, 'dd/MM')} — {format(weekEnd, 'dd/MM')}
          </span>
        </div>

        {/* ─── Desktop: Weekly grid ─── */}
        <div className="hidden md:grid grid-cols-7 gap-3">
          {days.map(day => {
            const isToday = isSameDay(day, new Date())
            const daySessions = sessions.filter(s => s.date === format(day, 'yyyy-MM-dd')).sort((a, b) => a.startTime.localeCompare(b.startTime))
            return (
              <div
                key={day.toString()}
                className={`flex flex-col rounded-xl border bg-[#0a0a0a] min-h-[280px] ${isToday ? 'border-gold/30' : 'border-[#1e1e1e]'}`}
              >
                {/* Day header */}
                <div
                  onClick={canEdit ? () => handleNewSession(format(day, 'yyyy-MM-dd')) : undefined}
                  className={`p-3 border-b text-center rounded-t-xl flex-shrink-0 ${canEdit ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${isToday ? 'bg-gold/10 border-gold/20' : 'bg-[#0f0f0f] border-[#1e1e1e]'}`}
                >
                  <span className={`text-[9px] uppercase font-bold tracking-widest block ${isToday ? 'text-gold' : 'text-[#555]'}`}>
                    {format(day, 'EEE', { locale: ptBR })}
                  </span>
                  <span className={`text-xl font-bebas tracking-wide block mt-0.5 ${isToday ? 'text-gold' : 'text-[#F0F0F0]'}`}>
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Sessions */}
                <div
                  onClick={canEdit ? () => handleNewSession(format(day, 'yyyy-MM-dd')) : undefined}
                  className={`flex-1 p-2 space-y-2 overflow-y-auto group ${canEdit ? 'cursor-pointer' : ''}`}
                >
                  {daySessions.map(session => {
                    const clrClass = serviceColors[session.serviceType] || serviceColors.outro
                    return (
                      <div
                        key={session.id}
                        onClick={canEdit ? e => { e.stopPropagation(); handleEditSession(session) } : undefined}
                        className={`p-2 rounded-lg border bg-[#111] flex flex-col gap-1.5 relative group/item ${clrClass} ${canEdit ? 'cursor-pointer hover:brightness-110 transition-all' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-semibold uppercase tracking-wide opacity-80">
                            {serviceLabels[session.serviceType]}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDots[session.status]}`} />
                            {canEdit && (
                              <button
                                onClick={e => handleDeleteSession(e, session.id, session.title)}
                                className="opacity-0 group-hover/item:opacity-100 text-[#444] hover:text-[#E74C3C] transition-all"
                              >
                                <Trash2 size={9} />
                              </button>
                            )}
                          </div>
                        </div>
                        <h4 className="text-[11px] font-semibold text-[#F0F0F0] truncate">{session.title}</h4>
                        <div className="flex items-center justify-between text-[9px] text-[#555]">
                          <span className="flex items-center gap-0.5"><Clock size={8} />{session.startTime}</span>
                          {session.value !== undefined && <span className="text-gold font-semibold">{fmt(session.value)}</span>}
                        </div>
                      </div>
                    )
                  })}
                  {daySessions.length === 0 && canEdit && (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity py-8">
                      <span className="text-[#333] text-2xl font-light">+</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Mobile: Stacked daily list ─── */}
        <div className="md:hidden space-y-3">
          {days.map(day => {
            const isToday = isSameDay(day, new Date())
            const daySessions = sessions.filter(s => s.date === format(day, 'yyyy-MM-dd')).sort((a, b) => a.startTime.localeCompare(b.startTime))
            return (
              <div
                key={day.toString() + '-m'}
                className={`rounded-xl border overflow-hidden ${isToday ? 'border-gold/30' : 'border-[#1e1e1e]'}`}
              >
                <div
                  onClick={canEdit ? () => handleNewSession(format(day, 'yyyy-MM-dd')) : undefined}
                  className={`px-4 py-3 flex justify-between items-center ${canEdit ? 'cursor-pointer' : ''} ${isToday ? 'bg-gold/10' : 'bg-[#0d0d0d]'}`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isToday ? 'text-gold' : 'text-[#555]'}`}>
                      {format(day, 'EEE', { locale: ptBR })}
                    </span>
                    <span className={`text-sm font-semibold ${isToday ? 'text-gold' : 'text-[#F0F0F0]'}`}>
                      {format(day, 'dd/MM')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#1a1a1a] border border-[#222] text-[#555] px-2 py-0.5 rounded-full">{daySessions.length}</span>
                    {canEdit && <span className="text-xs text-gold font-semibold">+ Agendar</span>}
                  </div>
                </div>

                {daySessions.length > 0 && (
                  <div className="bg-[#080808] divide-y divide-[#111]">
                    {daySessions.map(session => {
                      const clrClass = serviceColors[session.serviceType] || serviceColors.outro
                      return (
                        <div
                          key={session.id}
                          onClick={canEdit ? () => handleEditSession(session) : undefined}
                          className={`flex items-center justify-between px-4 py-3 gap-3 ${canEdit ? 'cursor-pointer hover:bg-[#0f0f0f] transition-colors' : ''}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDots[session.status]}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-[#F0F0F0] truncate">{session.title}</p>
                              <p className="text-[10px] text-[#555] flex items-center gap-1">
                                <User size={8} />{session.clientName}
                                <span className="text-[#333]">•</span>
                                <span className={`text-[8px] font-bold uppercase tracking-wider ${clrClass.split(' ')[1]}`}>{serviceLabels[session.serviceType]}</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <span className="text-xs text-[#888] block">{session.startTime} - {session.endTime}</span>
                              {session.value !== undefined && <span className="text-[10px] text-gold font-bold">{fmt(session.value)}</span>}
                            </div>
                            {canEdit && (
                              <button
                                onClick={e => handleDeleteSession(e, session.id, session.title)}
                                className="p-1.5 text-[#333] hover:text-[#E74C3C] rounded hover:bg-[#1a1a1a] transition-all"
                              >
                                <Trash2 size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ─── Upcoming sessions ─── */}
        <div className="bg-[#0a0a0a] border border-[#1e1e1e] rounded-xl p-5">
          <h3 className="font-bebas text-base text-[#F0F0F0] tracking-wider mb-4 flex items-center gap-2">
            <CalendarIcon size={15} className="text-gold" />
            Próximas Sessões
          </h3>
          {upcomingSessions.length === 0 ? (
            <p className="text-xs text-[#444] text-center py-6">Nenhuma sessão futura agendada.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {upcomingSessions.map(session => (
                <div
                  key={session.id}
                  onClick={canEdit ? () => handleEditSession(session) : undefined}
                  className={`bg-[#0d0d0d] border border-[#1a1a1a] hover:border-gold/20 rounded-xl p-3 transition-colors ${canEdit ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[9px] text-[#555] uppercase tracking-widest leading-none">
                      {format(parseISO(session.date), 'dd MMM', { locale: ptBR })}
                    </span>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDots[session.status]}`} />
                  </div>
                  <h4 className="text-xs font-semibold text-[#F0F0F0] truncate">{session.title}</h4>
                  <p className="text-[10px] text-[#444] truncate mt-0.5">{session.clientName}</p>
                  <div className="mt-2.5 pt-2 border-t border-[#1a1a1a] flex justify-between items-center text-[9px] text-[#444]">
                    <span className="flex items-center gap-0.5"><Clock size={8} />{session.startTime}</span>
                    {session.value !== undefined && <span className="text-gold font-semibold">{fmt(session.value)}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {canEdit && (
        <SessionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          session={selectedSession}
          onSave={loadData}
          defaultDate={targetDateStr}
        />
      )}
    </div>
  )
}
