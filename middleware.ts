import { NextResponse, type NextRequest } from 'next/server'

// Nossa autenticação usa localStorage/cookies próprios (não Supabase Auth),
// então o middleware não precisa fazer nada especial — apenas passa as requisições adiante.
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
