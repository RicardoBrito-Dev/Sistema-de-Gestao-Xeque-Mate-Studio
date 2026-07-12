import { NextResponse, type NextRequest } from 'next/server'

const SESSION_KEY = 'xm_session'

// Rotas que não precisam de autenticação
const PUBLIC_PATHS = ['/login', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Deixa passar rotas públicas e assets
  if (PUBLIC_PATHS.some(p => pathname === p) || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Verifica se existe o cookie de sessão
  const session = request.cookies.get(SESSION_KEY)

  if (!session) {
    // Sem sessão → redireciona para login preservando a URL de destino
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Protege todas as rotas exceto assets estáticos
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
