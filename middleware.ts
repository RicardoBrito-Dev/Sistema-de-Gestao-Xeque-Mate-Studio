import { NextResponse, type NextRequest } from 'next/server'

const SESSION_KEY = 'xm_session'

// Rotas que não precisam de autenticação
const PUBLIC_PATHS = ['/login', '/']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get(SESSION_KEY)

  // Se acessar a raiz "/"
  if (pathname === '/') {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se tentar acessar "/login" já estando logado → vai direto pro dashboard
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Deixa passar a tela de login e assets
  if (pathname === '/login' || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // Rotas protegidas (/dashboard, /schedule, etc.): sem sessão → vai para login
  if (!session) {
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
