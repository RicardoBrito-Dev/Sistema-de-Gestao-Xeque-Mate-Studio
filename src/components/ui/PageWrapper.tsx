// Componente de layout de página padronizado para todas as páginas do app
// Garante padding, max-width e espaçamento consistentes em todos os módulos

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
      <div>
        <h1 className="font-bebas text-3xl md:text-4xl text-[#F0F0F0] tracking-wider leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[#888] mt-1.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 w-full">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {children}
      </div>
    </div>
  )
}
