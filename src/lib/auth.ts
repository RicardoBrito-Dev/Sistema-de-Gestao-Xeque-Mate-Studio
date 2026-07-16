import { AuthSession, AppUser } from './types'
import { getUsers, saveUser, saveArtist, getUsersAsync } from './storage'
import bcrypt from 'bcryptjs'

const SESSION_KEY = 'xm_session'
const LOCKOUT_PREFIX = 'xm_lockout_'
const ATTEMPTS_PREFIX = 'xm_attempts_'

function getLockoutStatus(email: string): { locked: boolean; timeLeft: number } {
  if (typeof window === 'undefined') return { locked: false, timeLeft: 0 }
  const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const lockedUntil = localStorage.getItem(`${LOCKOUT_PREFIX}${cleanEmail}`)
  if (lockedUntil) {
    const time = parseInt(lockedUntil, 10)
    const now = Date.now()
    if (time > now) {
      return { locked: true, timeLeft: Math.ceil((time - now) / 1000) }
    } else {
      localStorage.removeItem(`${LOCKOUT_PREFIX}${cleanEmail}`)
      localStorage.removeItem(`${ATTEMPTS_PREFIX}${cleanEmail}`)
    }
  }
  return { locked: false, timeLeft: 0 }
}

function recordFailedAttempt(email: string): number {
  if (typeof window === 'undefined') return 0
  const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_')
  const rawAttempts = localStorage.getItem(`${ATTEMPTS_PREFIX}${cleanEmail}`)
  const attempts = (rawAttempts ? parseInt(rawAttempts, 10) : 0) + 1
  localStorage.setItem(`${ATTEMPTS_PREFIX}${cleanEmail}`, attempts.toString())
  
  if (attempts >= 5) {
    const lockTime = Date.now() + 60 * 1000 // 60 segundos
    localStorage.setItem(`${LOCKOUT_PREFIX}${cleanEmail}`, lockTime.toString())
  }
  return attempts
}

function clearAttempts(email: string): void {
  if (typeof window === 'undefined') return
  const cleanEmail = email.toLowerCase().replace(/[^a-z0-9]/g, '_')
  localStorage.removeItem(`${LOCKOUT_PREFIX}${cleanEmail}`)
  localStorage.removeItem(`${ATTEMPTS_PREFIX}${cleanEmail}`)
}

export async function login(email: string, password: string): Promise<AuthSession | null> {
  const { locked, timeLeft } = getLockoutStatus(email)
  if (locked) {
    throw new Error(`Muitas tentativas incorretas. Login bloqueado por mais ${timeLeft} segundos.`)
  }

  const users = await getUsersAsync()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    recordFailedAttempt(email)
    return null
  }

  // Password verification with migration support for plain text passwords
  let isPasswordValid = false
  const isHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')

  if (isHash) {
    isPasswordValid = await bcrypt.compare(password, user.password)
  } else {
    isPasswordValid = user.password === password
    if (isPasswordValid) {
      try {
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        saveUser(user)
      } catch (e) {
        console.error('Falha ao migrar senha para hash:', e)
      }
    }
  }

  if (!isPasswordValid) {
    recordFailedAttempt(email)
    return null
  }

  clearAttempts(email)

  const isApproved = user.id === 'u1' || user.role === 'admin' || user.approved === true
  if (!isApproved) {
    throw new Error('Sua conta está aguardando aprovação do administrador.')
  }

  // Session expires in 7 days
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000

  const session: AuthSession = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    artistId: user.artistId,
    avatarUrl: user.avatarUrl,
    approved: user.approved,
    expiresAt,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    document.cookie = `${SESSION_KEY}=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
  }

  return session
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY)
    // Remove o cookie de sessão
    document.cookie = `${SESSION_KEY}=; path=/; max-age=0`
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw) as AuthSession
    
    // Check if the session has expired
    if (session.expiresAt && Date.now() > session.expiresAt) {
      logout()
      return null
    }
    
    return session
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
  const hashedPassword = await bcrypt.hash(artistData.password, 10)
  
  const newUser: AppUser = {
    id: newUserId,
    email: artistData.email,
    password: hashedPassword,
    name: artistData.artisticName,
    role: artistData.role || 'artist',
    artistId: artistId,
    avatarUrl: artistData.avatarUrl,
    approved: artistData.approved ?? false,
  }

  saveUser(newUser)
  return newUser
}

export async function updatePassword(
  userId: string,
  currentPass: string,
  newPass: string
): Promise<void> {
  const users = await getUsersAsync()
  const user = users.find(u => u.id === userId)
  if (!user) {
    throw new Error('Usuário não encontrado.')
  }

  // Verify current password (supports plain text migration)
  let isPasswordValid = false
  const isHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')

  if (isHash) {
    isPasswordValid = await bcrypt.compare(currentPass, user.password)
  } else {
    isPasswordValid = user.password === currentPass
  }

  if (!isPasswordValid) {
    throw new Error('A senha atual está incorreta.')
  }

  // Hash new password and save
  const hashedNewPassword = await bcrypt.hash(newPass, 10)
  user.password = hashedNewPassword
  saveUser(user)
}

export async function updatePasswordByEmail(
  email: string,
  currentPass: string,
  newPass: string
): Promise<void> {
  const users = await getUsersAsync()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) {
    throw new Error('Usuário não encontrado.')
  }

  // Verify current password (supports plain text migration)
  let isPasswordValid = false
  const isHash = user.password.startsWith('$2a$') || user.password.startsWith('$2b$')

  if (isHash) {
    isPasswordValid = await bcrypt.compare(currentPass, user.password)
  } else {
    isPasswordValid = user.password === currentPass
  }

  if (!isPasswordValid) {
    throw new Error('A senha atual está incorreta.')
  }

  // Hash new password and save
  const hashedNewPassword = await bcrypt.hash(newPass, 10)
  user.password = hashedNewPassword
  saveUser(user)
}

export async function updateAvatar(userId: string, avatarUrl: string): Promise<AuthSession> {
  const users = await getUsersAsync()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('Usuário não encontrado.')

  user.avatarUrl = avatarUrl
  saveUser(user)

  // Update session in localStorage
  const SESSION_KEY_LOCAL = 'xm_session'
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem(SESSION_KEY_LOCAL)
    if (raw) {
      const session = JSON.parse(raw) as AuthSession
      session.avatarUrl = avatarUrl
      localStorage.setItem(SESSION_KEY_LOCAL, JSON.stringify(session))
    }
  }

  return { ...user, userId: user.id } as unknown as AuthSession
}

