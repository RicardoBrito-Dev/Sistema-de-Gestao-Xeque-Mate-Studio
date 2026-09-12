'use client'

import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: number
  color?: 'gold' | 'crimson' | 'green' | 'blue'
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = 'gold',
}: StatCardProps) {
  const colorMap = {
    gold: {
      bg: 'bg-[#15803d]/10',
      border: 'border-[#15803d]/25',
      text: 'text-[#22c55e]',
      glow: '',
    },
    crimson: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-400',
      glow: '',
    },
    green: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      glow: '',
    },
    blue: {
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      text: 'text-sky-400',
      glow: '',
    },
  }

  const selected = colorMap[color]

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="rounded-xl p-5 border border-[#222226] hover:border-[#2e2e35] transition-all flex flex-col justify-between h-full min-w-0 bg-[#121214]"
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <span className="text-xs font-semibold text-studio-muted uppercase tracking-wider truncate" title={title}>
          {title}
        </span>
        <div className={`p-2 rounded-lg ${selected.bg} border ${selected.border} shrink-0`}>
          <Icon className={`w-5 h-5 ${selected.text}`} />
        </div>
      </div>

      <div className="mt-4 min-w-0">
        <span 
          className="text-xl sm:text-2xl md:text-3xl font-bebas text-studio-text tracking-wide block truncate"
          title={String(value)}
        >
          {value}
        </span>
        
        {(subtitle || trend !== undefined) && (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-studio-muted min-w-0">
            {trend !== undefined && (
              <span className={`flex items-center gap-0.5 font-semibold shrink-0 ${trend >= 0 ? 'text-emerald-400' : 'text-crimson-light'}`}>
                {trend >= 0 ? (
                  <>
                    <TrendingUp size={12} />
                    <span>+{trend.toFixed(1)}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown size={12} />
                    <span>{trend.toFixed(1)}%</span>
                  </>
                )}
              </span>
            )}
            {subtitle && (
              <span className="truncate" title={subtitle}>{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
