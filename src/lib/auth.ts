import { AuthSession, AppUser } from './types'
import { getUsers, saveUser, saveArtist } from './storage'

const SESSION_KEY = 'xm_session'

export function login(email: string, password: string): AuthSession | null {
  const users = getUsers()
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return null

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    artistId: user.artistId,
    avatarUrl: user.avatarUrl,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }

  return session
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthSession
  } catch {
    return null
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

export function registerArtist(artistData: {
  artisticName: string
  email: string
  password: string
  avatarUrl?: string
  role?: 'admin' | 'artist'
}): AppUser | null {
  const users = getUsers()
  
  // Check if email already exists
  if (users.some(u => u.email.toLowerCase() === artistData.email.toLowerCase())) {
    return null
  }

  let artistId: string | undefined = undefined

  // Only create artist profile if the user is registered as an artist
  if (artistData.role !== 'admin') {
    artistId = 'a_' + Math.random().toString(36).substring(2, 9)
    const newArtist = {
      id: artistId,
      artisticName: artistData.artisticName,
      realName: artistData.artisticName,
      genre: 'outro' as const,
      status: 'ativo' as const,
      phone: '',
      email: artistData.email,
      avatar: artistData.avatarUrl || '',
      projectCount: 0,
      totalRevenue: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    }
    saveArtist(newArtist)
  }

  // Create new AppUser
  const newUserId = 'u_' + Math.random().toString(36).substring(2, 9)
  const newUser: AppUser = {
    id: newUserId,
    email: artistData.email,
    password: artistData.password,
    name: artistData.artisticName,
    role: artistData.role || 'artist',
    artistId: artistId,
    avatarUrl: artistData.avatarUrl,
  }

  saveUser(newUser)
  return newUser
}
