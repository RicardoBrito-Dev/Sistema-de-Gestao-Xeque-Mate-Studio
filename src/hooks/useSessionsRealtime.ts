'use client'

// ============================================================
// Hook: escuta mudanças em tempo real na tabela sessions.
// Quando qualquer usuário cria, edita ou remove um agendamento,
// todos os outros veem a mudança instantaneamente.
// ============================================================

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'

export function useSessionsRealtime(onUpdate: () => void) {
  useEffect(() => {
    if (!USE_SUPABASE) return

    const supabase = createClient()

    const channel = supabase
      .channel('sessions-realtime')
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: 'sessions' },
        () => { onUpdate() }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onUpdate])
}
