import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import type { Order } from '../types/order'
import { OrderTable } from '../components/OrderTable'

function normalizePhone(phone: string | null): string {
  return (phone || '').replace(/\D/g, '')
}

export function Customer() {
  const { phone } = useParams<{ phone: string }>()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const normalizedTarget = normalizePhone(phone || '')

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        const all = (data as Order[]) || []
        const filtered = normalizedTarget
          ? all.filter((o) => normalizePhone(o.phone) === normalizedTarget)
          : all

        setOrders(filtered)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки заказов клиента')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [normalizedTarget])

  const stats = useMemo(() => {
    if (!orders.length) {
      return {
        fullName: '',
        phone: phone || '',
        totalOrders: 0,
        totalSum: 0,
        totalDebt: 0,
        lastOrder: null as Order | null,
      }
    }

    const totalOrders = orders.length
    const totalSum = orders.reduce((s, o) => s + Number(o.total_price || 0), 0)
    const totalDebt = orders.reduce(
      (s, o) => s + Math.max(Number(o.total_price || 0) - Number(o.paid_amount || 0), 0),
      0,
    )
    const lastOrder = orders[0]
    const fullName = lastOrder.full_name
    const displayPhone = lastOrder.phone || phone || ''

    return { fullName, phone: displayPhone, totalOrders, totalSum, totalDebt, lastOrder }
  }, [orders, phone])

  function handleCreateOrder() {
    const params = new URLSearchParams()
    if (stats.phone) params.set('phone', stats.phone)
    if (stats.fullName) params.set('name', stats.fullName)
    navigate(`/orders/new?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Клиент</h1>
            {stats.fullName && <p className="text-sm text-gray-700">{stats.fullName}</p>}
            {stats.phone && <p className="text-sm text-gray-500">Телефон: {stats.phone}</p>}
          </div>
          <button
            type="button"
            onClick={handleCreateOrder}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Создать заказ этому клиенту
          </button>
        </div>

        {loading && <p className="text-gray-500 mb-4">Загрузка заказов клиента...</p>}
        {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Всего заказов</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Сумма заказов</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.totalSum.toLocaleString('ru-RU')} ₽
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Общий долг</p>
            <p className="text-2xl font-bold text-red-600">
              {stats.totalDebt.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </div>

        {stats.lastOrder && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 text-sm text-gray-700">
            <p className="font-semibold mb-1">Последний заказ</p>
            <p>№ {stats.lastOrder.order_number}</p>
            <p>Дата: {new Date(stats.lastOrder.created_at).toLocaleString('ru-RU')}</p>
            <p>Машина: {stats.lastOrder.car_model}</p>
            <p>Сумма: {Number(stats.lastOrder.total_price || 0).toLocaleString('ru-RU')} ₽</p>
          </div>
        )}

        <h2 className="text-lg font-semibold text-gray-800 mb-3">Заказы клиента</h2>
        <OrderTable
          orders={orders}
          onDelete={() => {}}
          onRepeat={() => {}}
          onStatusChange={() => {}}
        />
      </main>
    </div>
  )
}

