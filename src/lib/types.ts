// ============================================================
// XEQUE MATE STUDIO — Tipos Globais TypeScript
// ============================================================

export type ArtistStatus = 'ativo' | 'pausado' | 'inativo'
export type Genre = 'rap' | 'trap' | 'drill' | 'r&b' | 'funk' | 'outro'

export interface Artist {
  id: string
  artisticName: string
  realName: string
  genre: Genre
  status: ArtistStatus
  phone: string
  email: string
  instagram?: string
  spotify?: string
  youtube?: string
  bio?: string
  avatar?: string
  projectCount: number
  totalRevenue: number
  joinedAt: string // ISO date
}

// ============================================================

export type ClientType = 'externo' | 'artista-casa'
export type ServiceType = 'gravacao' | 'mix' | 'master' | 'recall' | 'producao' | 'outro'

export interface Client {
  id: string
  name: string
  phone: string
  email?: string
  clientType: ClientType
  instagram?: string
  totalSessions: number
  pendingBalance: number // R$
  totalSpent: number // R$
  notes?: string
  createdAt: string // ISO date
}

// ============================================================

export type KanbanStage = 'gravacao' | 'mix' | 'master' | 'recall' | 'entregue'
export type Priority = 'urgente' | 'normal' | 'espera'

export interface KanbanCard {
  id: string
  trackName: string
  artistName: string
  clientId?: string
  stage: KanbanStage
  priority: Priority
  entryDate: string // ISO date
  deadline?: string // ISO date
  notes?: string
  daysInStage: number
  driveLink?: string
}

// ============================================================

export type TransactionType = 'receita' | 'despesa'
export type TransactionCategory =
  | 'gravacao'
  | 'mix'
  | 'master'
  | 'recall'
  | 'producao'
  | 'equipamento'
  | 'aluguel'
  | 'marketing'
  | 'salario'
  | 'outro'

export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number // R$
  clientId?: string
  artistId?: string
  date: string // ISO date
  createdAt: string // ISO date
}

// ============================================================

export type SessionStatus = 'confirmado' | 'pendente' | 'cancelado' | 'concluido'

export interface Session {
  id: string
  title: string
  clientId: string
  clientName: string
  serviceType: ServiceType
  status: SessionStatus
  date: string // ISO date YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  notes?: string
  value?: number // R$
  createdAt: string
  sessionType?: 'estudio' | 'show'
  address?: string
}

// ============================================================
// Dashboard Summary Types
// ============================================================

export interface FinancialSummary {
  totalRevenue: number
  monthRevenue: number
  totalExpenses: number
  monthExpenses: number
  netProfit: number
  monthNetProfit: number
  revenueGrowth: number // % vs last month
}

export interface RevenueByMonth {
  month: string
  receita: number
  despesa: number
}

export interface RevenueByService {
  name: string
  value: number
  color: string
}

// ============================================================
// Auth Types
// ============================================================

export type UserRole = 'admin' | 'artist'

export interface AppUser {
  id: string
  email: string
  password: string
  name: string
  role: UserRole
  artistId?: string
  avatarUrl?: string
  approved?: boolean
}

export interface AuthSession {
  userId: string
  email: string
  name: string
  role: UserRole
  artistId?: string
  avatarUrl?: string
  approved?: boolean
  expiresAt?: number
}
