import { AppUser } from './types'

export const mockUsers: AppUser[] = [
  {
    id: 'u1',
    email: 'admin@xequemate.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
  },
  {
    id: 'u2',
    email: 'gerente@xequemate.com',
    password: 'admin123',
    name: 'Gerente Studio',
    role: 'admin',
  },
  {
    id: 'u3',
    email: 'sombra@xequemate.com',
    password: 'artista123',
    name: 'MC Sombra',
    role: 'artist',
    artistId: 'a1',
  },
  {
    id: 'u4',
    email: 'biaflow@xequemate.com',
    password: 'artista123',
    name: 'Bia Flow',
    role: 'artist',
    artistId: 'a2',
  },
  {
    id: 'u5',
    email: 'kraken@xequemate.com',
    password: 'artista123',
    name: 'Kraken',
    role: 'artist',
    artistId: 'a3',
  },
]
