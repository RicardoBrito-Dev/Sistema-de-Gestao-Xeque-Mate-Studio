'use client'

import React, { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getRevenueByService } from '@/lib/storage'
import { RevenueByService } from '@/lib/types'

export default function ServicePieChart() {
  const [data, setData] = useState<RevenueByService[]>([])

  useEffect(() => {
    setData(getRevenueByService())
  }, [])

  const total = data.reduce((sum, item) => sum + item.value, 0)

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val)
  }

  return (
    <div className="glass rounded-xl p-5 border border-studio-border shadow-gold/5 flex flex-col h-[380px]">
      <div className="flex flex-col mb-4">
        <h3 className="font-bebas text-lg text-studio-text tracking-wider">Serviços Mais Vendidos</h3>
        <p className="text-xs text-studio-muted">Divisão das receitas por categoria</p>
      </div>

      <div className="flex-1 relative w-full flex items-center justify-center">
        {data.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-sm text-studio-muted">Nenhum dado cadastrado.</p>
          </div>
        ) : (
          <>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <span className="text-[10px] text-studio-muted uppercase tracking-widest">Total</span>
              <span className="text-xl font-bebas text-studio-text tracking-wider">{formatCurrency(total)}</span>
            </div>
            
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161616',
                    border: '1px solid #2a2a2a',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="circle"
                  iconSize={8}
                  layout="horizontal"
                  wrapperStyle={{ bottom: -10 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  )
}
