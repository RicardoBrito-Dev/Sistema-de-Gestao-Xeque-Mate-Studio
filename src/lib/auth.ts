import { AuthSession, AppUser } from './types'
import { getUsers, saveUser, saveArtist, getUsersAsync } from './storage'

const SESSION_KEY = 'xm_session'

export async function login(email: string, password: string): Promise<AuthSession | null> {
  const users = await getUsersAsync()
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return null

  const isApproved = user.id === 'u1' || user.role === 'admin' || user.approved === true
  if (!isApproved) {
    throw new Error('Sua conta está aguardando aprovação do administrador.')
  }

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    artistId: user.artistId,
    avatarUrl: user.avatarUrl,
    approved: user.approved,
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

export async function registerArtist(artistData: {
  artisticName: string
  email: string
  password: string
  avatarUrl?: string
  role?: 'admin' | 'artist'
  approved?: boolean
}): Promise<AppUser> {
  // Busca a lista atualizada do banco (não do cache local)
  const users = await getUsersAsync()
  
  // Checa se o nome já está em uso
  if (users.some(u => u.name.trim().toLowerCase() === artistData.artisticName.trim().toLowerCase())) {
    throw new Error('Este nome de usuário ou nome artístico já está em uso.')
  }

  // Checa se o e-mail já está em uso
  if (users.some(u => u.email.toLowerCase() === artistData.email.toLowerCase())) {
    throw new Error('Este e-mail já está cadastrado.')
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
    approved: artistData.approved ?? false,
  }

  saveUser(newUser)
  return newUser
}

