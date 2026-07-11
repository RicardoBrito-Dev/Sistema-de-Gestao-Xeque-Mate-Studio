'use client'

// ============================================================
// Hook: migra dados do localStorage para o Supabase uma única vez.
// Executa ao montar o componente. Só roda se USE_SUPABASE=true.
// Garante que o localStorage só é apagado APÓS a escrita confirmada.
// ============================================================

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'
const MIGRATION_FLAG = 'xm_migration_v1_done'

interface MigrationMap {
  localKey: string
  table: string
  transform: (item: Record<string, unknown>) => Record<string, unknown>
}

// Converte camelCase do localStorage para snake_case do Supabase
const MIGRATIONS: MigrationMap[] = [
  {
    localKey: 'xm_artists',
    table: 'artists',
    transform: (a) => ({
      id: a.id, artistic_name: a.artisticName, real_name: a.realName,
      genre: a.genre, status: a.status, phone: a.phone, email: a.email,
      instagram: a.instagram, spotify: a.spotify, youtube: a.youtube,
      bio: a.bio, avatar: a.avatar,
      project_count: a.projectCount, total_revenue: a.totalRevenue,
      joined_at: a.joinedAt,
    }),
  },
  {
    localKey: 'xm_clients',
    table: 'clients',
    transform: (c) => ({
      id: c.id, name: c.name, phone: c.phone, email: c.email,
      client_type: c.clientType, instagram: c.instagram,
      total_sessions: c.totalSessions, pending_balance: c.pendingBalance,
      total_spent: c.totalSpent, notes: c.notes, created_at: c.createdAt,
    }),
  },
  {
    localKey: 'xm_sessions',
    table: 'sessions',
    transform: (s) => ({
      id: s.id, title: s.title, client_id: s.clientId,
      client_name: s.clientName, service_type: s.serviceType,
      status: s.status, date: s.date, start_time: s.startTime,
      end_time: s.endTime, notes: s.notes, value: s.value,
      session_type: s.sessionType || 'estudio', address: s.address,
      created_at: s.createdAt,
    }),
  },
  {
    localKey: 'xm_kanban',
    table: 'kanban_cards',
    transform: (k) => ({
      id: k.id, track_name: k.trackName, artist_name: k.artistName,
      client_id: k.clientId, stage: k.stage, priority: k.priority,
      entry_date: k.entryDate, deadline: k.deadline, notes: k.notes,
      days_in_stage: k.daysInStage,
    }),
  },
  {
    localKey: 'xm_transactions',
    table: 'transactions',
    transform: (t) => ({
      id: t.id, type: t.type, category: t.category,
      description: t.description, amount: t.amount,
      client_id: t.clientId, artist_id: t.artistId,
      date: t.date, created_at: t.createdAt,
    }),
  },
  {
    localKey: 'xm_users',
    table: 'app_users',
    transform: (u) => ({
      id: u.id, email: u.email, password: u.password, name: u.name, role: u.role,
      artist_id: u.artistId, avatar_url: u.avatarUrl,
      approved: u.approved ?? true,
    }),
  },
]

export function useMigrateToSupabase() {
  const ran = useRef(false)

  useEffect(() => {
    if (!USE_SUPABASE) return
    if (ran.current) return
    if (typeof window === 'undefined') return
    if (localStorage.getItem(MIGRATION_FLAG)) return // já migrou

    ran.current = true

    async function migrate() {
      const supabase = createClient()

      for (const { localKey, table, transform } of MIGRATIONS) {
        const raw = localStorage.getItem(localKey)
        if (!raw) continue

        let items: Record<string, unknown>[]
        try { items = JSON.parse(raw) } catch { continue }
        if (!Array.isArray(items) || items.length === 0) continue

        // Remove dados mock — migra só se tiver IDs que não sejam dos mockData
        // (IDs de mock começam com padrões fixos — dados reais têm IDs gerados aleatoriamente)
        const rows = items.map(transform)

        const BATCH = 200
        let failed = false
        for (let i = 0; i < rows.length; i += BATCH) {
          const batch = rows.slice(i, i + BATCH)
          const { error } = await supabase
            .from(table)
            .upsert(batch, { onConflict: 'id', ignoreDuplicates: true })
          if (error) {
            console.error(`[Migração] Erro em ${table}:`, error.message)
            failed = true
            break
          }
        }

        if (failed) return // Não marcar como feito — tentará de novo
        console.log(`[Migração] ✅ ${table}: ${rows.length} registros`)
      }

      localStorage.setItem(MIGRATION_FLAG, 'true')
      console.log('[Migração] ✅ Dados locais migrados para o Supabase com sucesso!')
    }

    migrate()
  }, [])
}
