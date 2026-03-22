import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import type { AdminUserOverviewRow } from '../types/admin'

function money(n: number) {
  return Number(n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 2 })
}

export function Admin() {
  const [rows, setRows] = useState<AdminUserOverviewRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forbidden, setForbidden] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      setForbidden(false)
      const { data, error: rpcError } = await supabase.rpc('admin_users_overview')
      if (cancelled) return
      if (rpcError) {
        const msg = rpcError.message || ''
        if (msg.includes('admin_only') || rpcError.code === 'P0001') {
          setForbidden(true)
        } else {
          setError(msg || 'Ошибка загрузки')
        }
        setRows([])
      } else {
        setRows((data as AdminUserOverviewRow[]) ?? [])
      }
      setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.orders += r.orders_count
        acc.sales += Number(r.total_sales || 0)
        acc.paid += Number(r.total_paid || 0)
        acc.debt += Number(r.total_debt || 0)
        return acc
      },
      { orders: 0, sales: 0, paid: 0, debt: 0 },
    )
  }, [rows])

  if (forbidden) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Админ-панель</h1>
          <p className="text-gray-600 mb-4">
            У вашего аккаунта нет прав администратора. Назначьте себе{' '}
            <code className="bg-gray-200 px-1 rounded text-sm">is_admin = true</code> в таблице{' '}
            <code className="bg-gray-200 px-1 rounded text-sm">user_settings</code> в Supabase (см. файл{' '}
            <code className="bg-gray-200 px-1 rounded text-sm">supabase-migration-admin-panel.sql</code>
            ).
          </p>
          <Link to="/app" className="text-blue-600 hover:underline">
            ← К заказам
          </Link>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Админ-панель</h1>
        <p className="text-sm text-gray-600 mb-6">
          Все зарегистрированные пользователи и агрегированная статистика по их заказам.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
        )}

        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Пользователей</p>
                <p className="text-xl font-bold text-gray-900">{rows.length}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Всего заказов</p>
                <p className="text-xl font-bold text-gray-900">{totals.orders}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Сумма заказов</p>
                <p className="text-xl font-bold text-gray-900">{money(totals.sales)} ₽</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <p className="text-xs text-gray-500">Общий долг</p>
                <p className="text-xl font-bold text-red-600">{money(totals.debt)} ₽</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Магазин
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Заказов
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Сумма
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Оплачено
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Долг
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Регистрация
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Последний заказ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.map((r) => (
                    <tr key={r.user_id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-xs text-gray-900 break-all">
                        {r.email || '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-700">{r.shop_name || '—'}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.orders_count}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{money(r.total_sales)} ₽</td>
                      <td className="px-3 py-2 text-right tabular-nums text-gray-700">
                        {money(r.total_paid)} ₽
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {Number(r.total_debt) > 0 ? (
                          <span className="text-red-600 font-medium">{money(r.total_debt)} ₽</span>
                        ) : (
                          <span className="text-green-700">0 ₽</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {r.registered_at
                          ? format(new Date(r.registered_at), 'dd.MM.yyyy', { locale: ru })
                          : '—'}
                      </td>
                      <td className="px-3 py-2 text-gray-600 whitespace-nowrap">
                        {r.last_order_at
                          ? format(new Date(r.last_order_at), 'dd.MM.yyyy HH:mm', { locale: ru })
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length === 0 && (
                <div className="px-4 py-10 text-center text-gray-500">Нет пользователей</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
