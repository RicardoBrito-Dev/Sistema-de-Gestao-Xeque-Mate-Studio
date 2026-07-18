// ============================================================
// XEQUE MATE STUDIO — Camada de dados Supabase
// Mesmas assinaturas do storage.ts — nenhuma página precisa mudar
// ============================================================

import { createClient } from '@/lib/supabase/client'
import {
  Artist, Client, KanbanCard, Transaction, Session, AppUser
} from '@/lib/types'

// Helper: converte snake_case do banco para camelCase do app
function toArtist(row: Record<string, unknown>): Artist {
  return {
    id: row.id as string,
    artisticName: row.artistic_name as string,
    realName: row.real_name as string,
    genre: row.genre as Artist['genre'],
    status: row.status as Artist['status'],
    phone: row.phone as string,
    email: row.email as string,
    instagram: row.instagram as string | undefined,
    spotify: row.spotify as string | undefined,
    youtube: row.youtube as string | undefined,
    bio: row.bio as string | undefined,
    avatar: row.avatar as string | undefined,
    projectCount: row.project_count as number,
    totalRevenue: row.total_revenue as number,
    joinedAt: row.joined_at as string,
  }
}

function fromArtist(a: Artist): Record<string, unknown> {
  return {
    id: a.id,
    artistic_name: a.artisticName,
    real_name: a.realName,
    genre: a.genre,
    status: a.status,
    phone: a.phone,
    email: a.email,
    instagram: a.instagram,
    spotify: a.spotify,
    youtube: a.youtube,
    bio: a.bio,
    avatar: a.avatar,
    project_count: a.projectCount,
    total_revenue: a.totalRevenue,
    joined_at: a.joinedAt,
  }
}

function toClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: row.phone as string,
    email: row.email as string | undefined,
    clientType: row.client_type as Client['clientType'],
    instagram: row.instagram as string | undefined,
    totalSessions: row.total_sessions as number,
    pendingBalance: row.pending_balance as number,
    totalSpent: row.total_spent as number,
    notes: row.notes as string | undefined,
    createdAt: row.created_at as string,
  }
}

function fromClient(c: Client): Record<string, unknown> {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    client_type: c.clientType,
    instagram: c.instagram,
    total_sessions: c.totalSessions,
    pending_balance: c.pendingBalance,
    total_spent: c.totalSpent,
    notes: c.notes,
    created_at: c.createdAt,
  }
}

function toSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    title: row.title as string,
    clientId: row.client_id as string,
    clientName: row.client_name as string,
    serviceType: row.service_type as Session['serviceType'],
    status: row.status as Session['status'],
    date: row.date as string,
    startTime: row.start_time as string,
    endTime: row.end_time as string,
    notes: row.notes as string | undefined,
    value: row.value as number | undefined,
    createdAt: row.created_at as string,
    sessionType: (row.session_type as Session['sessionType']) || 'estudio',
    address: row.address as string | undefined,
  }
}

function fromSession(s: Session): Record<string, unknown> {
  return {
    id: s.id,
    title: s.title,
    client_id: s.clientId,
    client_name: s.clientName,
    service_type: s.serviceType,
    status: s.status,
    date: s.date,
    start_time: s.startTime,
    end_time: s.endTime,
    notes: s.notes,
    value: s.value,
    created_at: s.createdAt,
    session_type: s.sessionType || 'estudio',
    address: s.address,
  }
}

function toKanban(row: Record<string, unknown>): KanbanCard {
  return {
    id: row.id as string,
    trackName: row.track_name as string,
    artistName: row.artist_name as string,
    clientId: row.client_id as string | undefined,
    stage: row.stage as KanbanCard['stage'],
    priority: row.priority as KanbanCard['priority'],
    entryDate: row.entry_date as string,
    deadline: row.deadline as string | undefined,
    notes: row.notes as string | undefined,
    daysInStage: row.days_in_stage as number,
    driveLink: row.drive_link as string | undefined,
  }
}

function fromKanban(k: KanbanCard): Record<string, unknown> {
  return {
    id: k.id,
    track_name: k.trackName,
    artist_name: k.artistName,
    client_id: k.clientId,
    stage: k.stage,
    priority: k.priority,
    entry_date: k.entryDate,
    deadline: k.deadline,
    notes: k.notes,
    days_in_stage: k.daysInStage,
    drive_link: k.driveLink,
  }
}

function toTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    type: row.type as Transaction['type'],
    category: row.category as Transaction['category'],
    description: row.description as string,
    amount: row.amount as number,
    clientId: row.client_id as string | undefined,
    artistId: row.artist_id as string | undefined,
    date: row.date as string,
    createdAt: row.created_at as string,
  }
}

function fromTransaction(t: Transaction): Record<string, unknown> {
  return {
    id: t.id,
    type: t.type,
    category: t.category,
    description: t.description,
    amount: t.amount,
    client_id: t.clientId,
    artist_id: t.artistId,
    date: t.date,
    created_at: t.createdAt,
  }
}

function toAppUser(row: Record<string, unknown>): AppUser {
  return {
    id: row.id as string,
    email: row.email as string,
    password: (row.password as string) || '',
    name: row.name as string,
    role: row.role as AppUser['role'],
    artistId: row.artist_id as string | undefined,
    avatarUrl: row.avatar_url as string | undefined,
    approved: !!row.approved,
  }
}

function fromAppUser(u: AppUser): Record<string, unknown> {
  return {
    id: u.id,
    email: u.email,
    password: u.password,
    name: u.name,
    role: u.role,
    artist_id: u.artistId,
    avatar_url: u.avatarUrl,
    approved: u.approved ?? false,
  }
}

// ============================================================
// Artists
// ============================================================

export async function dbGetArtists(): Promise<Artist[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('artistic_name')
  if (error || !data) { console.error('dbGetArtists:', error?.message); return [] }
  return (data as Record<string, unknown>[]).map(toArtist)
}

export async function dbSaveArtist(artist: Artist): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('artists')
    .upsert(fromArtist(artist), { onConflict: 'id' })
  if (error) console.error('dbSaveArtist:', error.message)
}

export async function dbDeleteArtist(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('artists').delete().eq('id', id)
  if (error) console.error('dbDeleteArtist:', error.message)
}

// ============================================================
// Clients
// ============================================================

export async function dbGetClients(): Promise<Client[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name')
  if (error || !data) { console.error('dbGetClients:', error?.message); return [] }
  return (data as Record<string, unknown>[]).map(toClient)
}

export async function dbSaveClient(client: Client): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('clients')
    .upsert(fromClient(client), { onConflict: 'id' })
  if (error) console.error('dbSaveClient:', error.message)
}

export async function dbDeleteClient(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('clients').delete().eq('id', id)
  if (error) console.error('dbDeleteClient:', error.message)
}

// ============================================================
// Sessions
// ============================================================

export async function dbGetSessions(): Promise<Session[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('date', { ascending: false })
  if (error || !data) { console.error('dbGetSessions:', error?.message); return [] }
  return (data as Record<string, unknown>[]).map(toSession)
}

export async function dbSaveSession(session: Session): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('sessions')
    .upsert(fromSession(session), { onConflict: 'id' })
  if (error) console.error('dbSaveSession:', error.message)
}

export async function dbDeleteSession(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('sessions').delete().eq('id', id)
  if (error) console.error('dbDeleteSession:', error.message)
}

// ============================================================
// Kanban
// ============================================================

export async function dbGetKanbanCards(): Promise<KanbanCard[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('kanban_cards')
    .select('*')
    .order('entry_date', { ascending: false })
  if (error || !data) { console.error('dbGetKanbanCards:', error?.message); return [] }
  return (data as Record<string, unknown>[]).map(toKanban)
}

export async function dbSaveKanbanCard(card: KanbanCard): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .upsert(fromKanban(card), { onConflict: 'id' })
  if (error) console.error('dbSaveKanbanCard:', error.message)
}

export async function dbDeleteKanbanCard(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('kanban_cards').delete().eq('id', id)
  if (error) console.error('dbDeleteKanbanCard:', error.message)
}

export async function dbUpdateKanbanStage(
  id: string,
  stage: KanbanCard['stage']
): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('kanban_cards')
    .update({ stage, days_in_stage: 0 })
    .eq('id', id)
  if (error) console.error('dbUpdateKanbanStage:', error.message)
}

// ============================================================
// Transactions
// ============================================================

export async function dbGetTransactions(): Promise<Transaction[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
  if (error || !data) { console.error('dbGetTransactions:', error?.message); return [] }
  return (data as Record<string, unknown>[]).map(toTransaction)
}

export async function dbSaveTransaction(tx: Transaction): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('transactions')
    .upsert(fromTransaction(tx), { onConflict: 'id' })
  if (error) console.error('dbSaveTransaction:', error.message)
}

export async function dbDeleteTransaction(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) console.error('dbDeleteTransaction:', error.message)
}

// ============================================================
// App Users (auth do próprio app)
// ============================================================

export async function dbGetUsers(): Promise<AppUser[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('app_users').select('*')
  if (error || !data) { console.error('dbGetUsers:', error?.message); return [] }
  
  const list = (data as Record<string, unknown>[]).map(toAppUser)
  
  // Seed automático: Garante que o administrador master esteja sempre no banco
  const hasMaster = list.some(u => u.email === 'admin@xequemate.com')
  if (!hasMaster) {
    const masterAdmin: AppUser = {
      id: 'u1',
      email: 'admin@xequemate.com',
      password: '$2b$10$3zUqmsJMo.0UCEyoeU4MK.tXE6bwMx7AKOP6pMNp0R.pJTTTYfInq', // bcrypt hash of admin123
      name: 'Administrador',
      role: 'admin',
      approved: true,
    }
    
    // Insere no banco em background
    supabase
      .from('app_users')
      .upsert({
        id: masterAdmin.id,
        email: masterAdmin.email,
        password: masterAdmin.password,
        name: masterAdmin.name,
        role: masterAdmin.role,
        approved: true,
      })
      .then(({ error: upsertErr }) => {
        if (upsertErr) console.error('Erro ao semear administrador master:', upsertErr.message)
      })
      
    list.push(masterAdmin)
  }
  
  return list
}

export async function dbSaveUser(user: AppUser): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('app_users')
    .upsert(fromAppUser(user), { onConflict: 'id' })
  if (error) console.error('dbSaveUser:', error.message)
}

export async function dbDeleteUserCascaded(userId: string, artistId?: string, userName?: string): Promise<void> {
  const supabase = createClient()
  
  // 1. Exclui o login do usuário
  await supabase.from('app_users').delete().eq('id', userId)
  
  if (artistId) {
    // 2. Exclui o perfil do artista
    await supabase.from('artists').delete().eq('id', artistId)
    
    // 3. Exclui as sessões associadas
    await supabase.from('sessions').delete().eq('client_id', artistId)
    
    // 4. Exclui as transações associadas
    await supabase
      .from('transactions')
      .delete()
      .or(`artist_id.eq.${artistId},client_id.eq.${artistId}`)
      
    // 5. Exclui os cards de kanban do artista
    if (userName) {
      await supabase
        .from('kanban_cards')
        .delete()
        .or(`client_id.eq.${artistId},artist_name.eq.${userName}`)
    } else {
      await supabase.from('kanban_cards').delete().eq('client_id', artistId)
    }
  }
}
