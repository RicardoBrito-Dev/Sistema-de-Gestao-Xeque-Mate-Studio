import { AuthSession, Artist, KanbanCard, Session, Transaction } from './types'
import { getArtists } from './storage'

export function canEdit(user: AuthSession | null): boolean {
  return user?.role === 'admin'
}

export function canEditSession(session: Session | null, user: AuthSession | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  if (user.role === 'artist') {
    if (!session) return true // Creating new sessions is allowed
    return session.clientId === user.artistId
  }
  return false
}

export function isAdmin(user: AuthSession | null): boolean {
  return user?.role === 'admin'
}

export function isArtist(user: AuthSession | null): boolean {
  return user?.role === 'artist'
}

const ADMIN_ONLY_ROUTES = ['/clients', '/finances']

export function canAccessRoute(pathname: string, user: AuthSession | null): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  return !ADMIN_ONLY_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))
}

export function getArtistName(user: AuthSession | null): string | null {
  if (!user) return null
  if (user.artistId) {
    const artist = getArtists().find(a => a.id === user.artistId)
    if (artist?.artisticName) return artist.artisticName
  }
  return user.name || null
}

export function filterArtistsForUser(artists: Artist[], user: AuthSession | null): Artist[] {
  if (!user || user.role === 'admin') return artists
  if (!user.artistId) return []
  return artists.filter(a => a.id === user.artistId)
}

export function filterKanbanForUser(cards: KanbanCard[], user: AuthSession | null): KanbanCard[] {
  if (!user || user.role === 'admin') return cards
  const artistName = getArtistName(user)
  return cards.filter(c => {
    if (user.artistId && c.clientId === user.artistId) return true
    if (artistName && c.artistName?.trim().toLowerCase() === artistName.trim().toLowerCase()) return true
    if (user.name && c.artistName?.trim().toLowerCase() === user.name.trim().toLowerCase()) return true
    return false
  })
}

export function filterSessionsForUser(sessions: Session[], user: AuthSession | null): Session[] {
  if (!user || user.role === 'admin') return sessions
  if (!user.artistId) return []
  return sessions.filter(s => s.clientId === user.artistId)
}

export function filterTransactionsForUser(transactions: Transaction[], user: AuthSession | null): Transaction[] {
  if (!user || user.role === 'admin') return transactions
  if (!user.artistId) return []
  return transactions.filter(t => t.artistId === user.artistId)
}

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', adminOnly: false },
  { href: '/artists', label: 'Artistas', adminOnly: false },
  { href: '/clients', label: 'Clientes', adminOnly: true },
  { href: '/kanban', label: 'Produção', adminOnly: false },
  { href: '/albums', label: 'Álbuns', adminOnly: false },
  { href: '/schedule', label: 'Agenda', adminOnly: false },
  { href: '/finances', label: 'Financeiro', adminOnly: true },
] as const

export function getNavItemsForUser(user: AuthSession | null) {
  if (user?.role === 'admin') return NAV_ITEMS
  return NAV_ITEMS.filter(item => !item.adminOnly)
}
