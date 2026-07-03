import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'

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
        <Sidebar />
        <main className="flex-1 min-h-screen flex flex-col pt-6 pb-28 md:py-8 md:pl-24 md:pr-16 min-w-0 transition-all duration-300">
          {children}
        </main>
      </body>
    </html>
  )
}
