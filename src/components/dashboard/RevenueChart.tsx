'use client'

import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts'
import { getRevenueByMonthAsync } from '@/lib/storage'
import { RevenueByMonth } from '@/lib/types'

export default function RevenueChart() {
  const [data, setData] = useState<RevenueByMonth[]>([])

  useEffect(() => {
    const load = async () => {
      const res = await getRevenueByMonthAsync()
      setData(res)
    }
    load()
  }, [])

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
        <h3 className="font-bebas text-lg text-studio-text tracking-wider">Fluxo de Caixa</h3>
        <p className="text-xs text-studio-muted">Receitas vs Despesas (últimos 6 meses)</p>
      </div>

      <div className="flex-1 w-full text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#555"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#888', fontSize: 11 }}
            />
            <YAxis
              stroke="#555"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#888', fontSize: 11 }}
              tickFormatter={(v) => `R$ ${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#161616',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
              labelStyle={{ color: '#16a34a', fontWeight: 'bold' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ top: -15, right: 0 }}
            />
            <Bar
              name="Receitas"
              dataKey="receita"
              fill="#16a34a"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              name="Despesas"
              dataKey="despesa"
              fill="#C0392B"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
