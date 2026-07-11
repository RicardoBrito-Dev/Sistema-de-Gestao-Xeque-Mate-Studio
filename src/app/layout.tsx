import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/AppShell'
import { SupabaseProvider } from '@/components/SupabaseProvider'

export const metadata: Metadata = {
  title: 'Xeque Mate Studio',
  description: 'Sistema de gestão para o estúdio musical Xeque Mate — Rap, Trap, Drill e muito mais.',
  keywords: 'estúdio musical, rap, gravação, mix, master, xeque mate',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0a0a0a] text-[#F0F0F0] min-h-screen flex">
        <AuthProvider>
          <SupabaseProvider>
            <AppShell>{children}</AppShell>
          </SupabaseProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
