import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import AppShell from '@/components/AppShell'
import { SupabaseProvider } from '@/components/SupabaseProvider'
import PwaRegister from '@/components/PwaRegister'

export const metadata: Metadata = {
  title: 'Xeque Mate Studio',
  description: 'Sistema de gestão para o estúdio musical Xeque Mate — Rap, Trap, Drill e muito mais.',
  keywords: 'estúdio musical, rap, gravação, mix, master, xeque mate',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Xeque Mate',
  },
  icons: {
    icon: '/icon-512.jpg',
    apple: '/icon-192.jpg',
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        {/* PWA: ícone para iOS (sem suporte a manifest nativo) */}
        <link rel="apple-touch-icon" href="/icon-192.jpg" />
        {/* Splash screen color no iOS */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#09090b] text-[#f4f4f5] min-h-screen flex flex-col">
        <PwaRegister />
        <AuthProvider>
          <SupabaseProvider>
            <AppShell>{children}</AppShell>
          </SupabaseProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
