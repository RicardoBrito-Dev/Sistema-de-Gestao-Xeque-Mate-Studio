import React from 'react'

interface BadgeProps {
  variant?: 'gold' | 'crimson' | 'green' | 'blue' | 'purple' | 'gray' | 'yellow'
  size?: 'sm' | 'md'
  children: React.ReactNode
  className?: string
}

export default function Badge({
  variant = 'gray',
  size = 'sm',
  children,
  className = '',
}: BadgeProps) {
  const variantStyles = {
    gold: 'bg-gold/10 text-gold border-gold/20',
    crimson: 'bg-crimson/10 text-crimson-light border-crimson/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    gray: 'bg-studio-muted-dark/10 text-studio-muted border-studio-border',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px] tracking-wider',
    md: 'px-3 py-1 text-xs tracking-wide',
  }

  return (
    <span
      className={`
        inline-flex items-center justify-center font-semibold rounded-full border uppercase
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
