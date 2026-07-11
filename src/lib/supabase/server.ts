import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Chaves públicas do Supabase (anon key é segura para ficar no código —
// a segurança real vem das políticas RLS no banco, não desta chave).
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  ?? 'https://bvlybqzlkwibimqzdeyz.supabase.co'

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ?? 'sb_publishable_M8jz5CrPQkBFXV5Vq0qySA_ypPVlWZT'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Server Component — cookies só podem ser modificados pelo middleware
        }
      },
    },
  })
}
