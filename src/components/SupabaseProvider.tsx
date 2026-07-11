'use client'

// Componente client que inicializa hooks globais do Supabase:
// - migração única do localStorage para o banco
// Deve ser renderizado dentro do AuthProvider.

import { useMigrateToSupabase } from '@/hooks/useMigrateToSupabase'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  useMigrateToSupabase()
  return <>{children}</>
}
