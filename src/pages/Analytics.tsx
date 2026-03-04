import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import type { Order } from '../types/order'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  ordered: 'Заказан',
  received: 'Получен',
  completed: 'Выполнен',
  cancelled: 'Отменён',
}

const STATUS_COLORS: Record<string, string> = {
  new: '#3b82f6',
  ordered: '#f59e0b',
  received: '#8b5cf6',
  completed: '#22c55e',
  cancelled: '#ef4444',
}

interface DailyPoint {
  date: string
  sum: number
  count: number
}

export function Analytics() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const since = new Date()
        since.setDate(since.getDate() - 30)
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: true })

        if (error) throw error
        setOrders((data || []) as Order[])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const { daily, statusData, avgCheck, repeatClients } = useMemo(() => {
    const byDate = new Map<string, DailyPoint>()
    const byPhone = new Map<string, number>()
    const byStatus = new Map<string, number>()

    for (const o of orders) {
      const d = new Date(o.created_at)
      const key = d.toISOString().slice(0, 10)
      const price = Number(o.total_price || 0)

      const prev = byDate.get(key) || { date: key, sum: 0, count: 0 }
      prev.sum += price
      prev.count += 1
      byDate.set(key, prev)

      const normPhone = (o.phone || '').replace(/\D/g, '')
      if (normPhone) {
        byPhone.set(normPhone, (byPhone.get(normPhone) || 0) + 1)
      }

      byStatus.set(o.status, (byStatus.get(o.status) || 0) + 1)
    }

    const daily: DailyPoint[] = Array.from(byDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    )

    const totalSum = daily.reduce((s, d) => s + d.sum, 0)
    const totalCount = daily.reduce((s, d) => s + d.count, 0)
    const avgCheck = totalCount ? totalSum / totalCount : 0

    let repeatClients = 0
    for (const [, count] of byPhone) {
      if (count >= 2) repeatClients += 1
    }

    const statusData = Array.from(byStatus.entries()).map(([status, count]) => ({
      status,
      label: STATUS_LABELS[status] || status,
      value: count,
    }))

    return { daily, statusData, avgCheck, repeatClients }
  }, [orders])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Аналитика</h1>
        {loading && <p className="text-gray-500 mb-4">Загрузка...</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Всего заказов (30 дней)</p>
            <p className="text-2xl font-bold text-gray-800">
              {daily.reduce((s, d) => s + d.count, 0)}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Выручка (30 дней)</p>
            <p className="text-2xl font-bold text-gray-800">
              {daily.reduce((s, d) => s + d.sum, 0).toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Средний чек</p>
            <p className="text-2xl font-bold text-gray-800">
              {Math.round(avgCheck).toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-700 mb-2">Выручка по дням (последние 30 дней)</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value?: number) =>
                      value !== undefined
                        ? [`${value.toLocaleString('ru-RU')} ₽`, 'Выручка']
                        : ['', 'Выручка']
                    }
                    labelFormatter={(label) => `Дата: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="sum"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-700 mb-2">Количество заказов по дням</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(value?: number) =>
                      value !== undefined ? [value, 'Заказы'] : ['', 'Заказы']
                    }
                    labelFormatter={(label) => `Дата: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-700 mb-2">Заказы по статусам</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                  >
                    {statusData.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] || '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value?: number, name?: string) => [
                      value ?? 0,
                      name || 'Статус',
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-700 mb-2">Повторные клиенты</p>
            <p className="text-2xl font-bold text-gray-800 mb-1">
              {repeatClients}
            </p>
            <p className="text-xs text-gray-500 mb-2">
              Количество телефонов, по которым было 2 и более заказов за последние 30 дней.
            </p>
            <p className="text-xs text-gray-500">
              Доля повторных клиентов можно посчитать как repeat / общее количество уникальных телефонов — это можно
              добавить отдельным показателем позже.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

