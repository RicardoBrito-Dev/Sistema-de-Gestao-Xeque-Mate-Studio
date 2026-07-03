// ============================================================
// XEQUE MATE STUDIO — CRUD tipado no localStorage
// ============================================================

import {
  Artist, Client, KanbanCard, Transaction, Session
} from './types'
import {
  mockArtists, mockClients, mockKanbanCards, mockTransactions, mockSessions
} from './mockData'

const KEYS = {
  artists: 'xm_artists',
  clients: 'xm_clients',
  kanban: 'xm_kanban',
  transactions: 'xm_transactions',
  sessions: 'xm_sessions',
} as const

function getItem<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback))
      return fallback
    }
    return JSON.parse(raw) as T[]
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

// ============================================================
// Artists
// ============================================================

export function getArtists(): Artist[] {
  return getItem<Artist>(KEYS.artists, mockArtists)
}

export function saveArtist(artist: Artist): void {
  const all = getArtists()
  const idx = all.findIndex(a => a.id === artist.id)
  if (idx >= 0) all[idx] = artist
  else all.unshift(artist)
  setItem(KEYS.artists, all)
}

export function deleteArtist(id: string): void {
  setItem(KEYS.artists, getArtists().filter(a => a.id !== id))
}

// ============================================================
// Clients
// ============================================================

export function getClients(): Client[] {
  return getItem<Client>(KEYS.clients, mockClients)
}

export function saveClient(client: Client): void {
  const all = getClients()
  const idx = all.findIndex(c => c.id === client.id)
  if (idx >= 0) all[idx] = client
  else all.unshift(client)
  setItem(KEYS.clients, all)
}

export function deleteClient(id: string): void {
  setItem(KEYS.clients, getClients().filter(c => c.id !== id))
}

// ============================================================
// Kanban
// ============================================================

export function getKanbanCards(): KanbanCard[] {
  return getItem<KanbanCard>(KEYS.kanban, mockKanbanCards)
}

export function saveKanbanCard(card: KanbanCard): void {
  const all = getKanbanCards()
  const idx = all.findIndex(k => k.id === card.id)
  if (idx >= 0) all[idx] = card
  else all.unshift(card)
  setItem(KEYS.kanban, all)
}

export function deleteKanbanCard(id: string): void {
  setItem(KEYS.kanban, getKanbanCards().filter(k => k.id !== id))
}

export function updateKanbanStage(id: string, stage: KanbanCard['stage']): void {
  const all = getKanbanCards()
  const card = all.find(k => k.id === id)
  if (card) {
    card.stage = stage
    card.daysInStage = 0
    setItem(KEYS.kanban, all)
  }
}

// ============================================================
// Transactions
// ============================================================

export function getTransactions(): Transaction[] {
  return getItem<Transaction>(KEYS.transactions, mockTransactions)
}

export function saveTransaction(tx: Transaction): void {
  const all = getTransactions()
  const idx = all.findIndex(t => t.id === tx.id)
  if (idx >= 0) all[idx] = tx
  else all.unshift(tx)
  setItem(KEYS.transactions, all)
}

export function deleteTransaction(id: string): void {
  setItem(KEYS.transactions, getTransactions().filter(t => t.id !== id))
}

// ============================================================
// Sessions
// ============================================================

export function getSessions(): Session[] {
  return getItem<Session>(KEYS.sessions, mockSessions)
}

export function saveSession(session: Session): void {
  const all = getSessions()
  const idx = all.findIndex(s => s.id === session.id)
  if (idx >= 0) all[idx] = session
  else all.unshift(session)
  setItem(KEYS.sessions, all)
}

export function deleteSession(id: string): void {
  setItem(KEYS.sessions, getSessions().filter(s => s.id !== id))
}

// ============================================================
// Financial Summary
// ============================================================

export function getFinancialSummary() {
  const txs = getTransactions()
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const thisMonthTxs = txs.filter(t => {
    const d = new Date(t.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const lastMonthTxs = txs.filter(t => {
    const d = new Date(t.date)
    const lm = currentMonth === 0 ? 11 : currentMonth - 1
    const ly = currentMonth === 0 ? currentYear - 1 : currentYear
    return d.getMonth() === lm && d.getFullYear() === ly
  })

  const totalRevenue = txs.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = txs.filter(t => t.type === 'despesa').reduce((s, t) => s + t.amount, 0)
  const monthRevenue = thisMonthTxs.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0)
  const monthExpenses = thisMonthTxs.filter(t => t.type === 'despesa').reduce((s, t) => s + t.amount, 0)
  const lastMonthRevenue = lastMonthTxs.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0)

  const revenueGrowth = lastMonthRevenue > 0
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    : 0

  return {
    totalRevenue,
    monthRevenue,
    totalExpenses,
    monthExpenses,
    netProfit: totalRevenue - totalExpenses,
    monthNetProfit: monthRevenue - monthExpenses,
    revenueGrowth,
  }
}

export function getRevenueByMonth() {
  const txs = getTransactions()
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  const now = new Date()

  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const m = d.getMonth()
    const y = d.getFullYear()
    const filtered = txs.filter(t => {
      const td = new Date(t.date)
      return td.getMonth() === m && td.getFullYear() === y
    })
    return {
      month: months[m],
      receita: filtered.filter(t => t.type === 'receita').reduce((s, t) => s + t.amount, 0),
      despesa: filtered.filter(t => t.type === 'despesa').reduce((s, t) => s + t.amount, 0),
    }
  })
}

export function getRevenueByService() {
  const txs = getTransactions().filter(t => t.type === 'receita')
  const categories: Record<string, { name: string; color: string }> = {
    gravacao: { name: 'Gravação', color: '#D4AF37' },
    mix: { name: 'Mix', color: '#C0392B' },
    master: { name: 'Master', color: '#8E44AD' },
    recall: { name: 'Recall', color: '#2980B9' },
    producao: { name: 'Produção', color: '#27AE60' },
    outro: { name: 'Outro', color: '#7F8C8D' },
  }

  const totals: Record<string, number> = {}
  txs.forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount
  })

  return Object.entries(totals)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: categories[k]?.name || k,
      value: v,
      color: categories[k]?.color || '#999',
    }))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
