import { AuthSession, Artist, KanbanCard, Session, Transaction } from './types'
import { getArtists } from './storage'

export function canEdit(user: AuthSession | null): boolean {
  return user?.role === 'admin'
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
  if (!user?.artistId) return null
  const artist = getArtists().find(a => a.id === user.artistId)
  return artist?.artisticName ?? null
}

export function filterArtistsForUser(artists: Artist[], user: AuthSession | null): Artist[] {
  if (!user || user.role === 'admin') return artists
  if (!user.artistId) return []
  return artists.filter(a => a.id === user.artistId)
}

export function filterKanbanForUser(cards: KanbanCard[], user: AuthSession | null): KanbanCard[] {
  if (!user || user.role === 'admin') return cards
  const artistName = getArtistName(user)
  if (!artistName) return []
  return cards.filter(c => c.artistName === artistName)
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
  { href: '/schedule', label: 'Agenda', adminOnly: false },
  { href: '/finances', label: 'Financeiro', adminOnly: true },
] as const

export function getNavItemsForUser(user: AuthSession | null) {
  if (!user) return []
  if (user.role === 'admin') return NAV_ITEMS
  return NAV_ITEMS.filter(item => !item.adminOnly)
}
