import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { startOfDay } from 'date-fns'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import { OrderTable } from '../components/OrderTable'
import type { Order, OrderStatus } from '../types/order'

export function Dashboard() {
  const location = useLocation()
  const [orders, setOrders] = useState<Order[]>([])
  const [showCreatedNotice, setShowCreatedNotice] = useState(false)

  useEffect(() => {
    if (location.state?.orderCreated) {
      setShowCreatedNotice(true)
      window.history.replaceState({}, '', location.pathname)
      const t = setTimeout(() => setShowCreatedNotice(false), 3000)
      return () => clearTimeout(t)
    }
  }, [location.state?.orderCreated, location.pathname])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteConfirm, setDeleteConfirm] = useState<Order | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  useEffect(() => {
    let result = [...orders]

    if (search.trim()) {
      const q = search.toLowerCase().trim()
      result = result.filter(
        (o) =>
          o.full_name.toLowerCase().includes(q) ||
          (o.phone && o.phone.includes(q)) ||
          o.car_model.toLowerCase().includes(q)
      )
    }

    if (statusFilter !== 'all') {
      result = result.filter((o) => o.status === statusFilter)
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

    setFilteredOrders(result)
  }, [orders, search, statusFilter, sortOrder])

  async function loadOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data ?? [])
    } catch (err) {
      console.error('Ошибка загрузки заказов:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(order: Order) {
    try {
      const { error } = await supabase.from('orders').delete().eq('id', order.id)
      if (error) throw error
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Ошибка удаления:', err)
    }
  }

  const todayStart = startOfDay(new Date()).toISOString()
  const todayOrders = orders.filter((o) => o.created_at >= todayStart)
  const todayCount = todayOrders.length
  const totalSum = orders.reduce((s, o) => s + Number(o.total_price), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        {showCreatedNotice && (
          <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg font-medium">
            Заказ создан
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Заказы</h1>
          <Link
            to="/orders/new"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Создать заказ
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Сегодня заказов</p>
            <p className="text-2xl font-bold text-gray-800">{todayCount}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Всего заказов</p>
            <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Сумма</p>
            <p className="text-2xl font-bold text-gray-800">{totalSum.toLocaleString('ru-RU')} ₽</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Поиск по ФИО, телефону, машине..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Все статусы</option>
              <option value="new">Новый</option>
              <option value="ordered">Заказан</option>
              <option value="received">Получен</option>
              <option value="completed">Выполнен</option>
              <option value="cancelled">Отменён</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Сначала новые</option>
              <option value="asc">Сначала старые</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Загрузка...</div>
        ) : (
          <OrderTable orders={filteredOrders} onDelete={(o) => setDeleteConfirm(o)} />
        )}
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Удалить заказ?</h3>
            <p className="text-gray-600 mb-4">
              Заказ №{deleteConfirm.order_number} ({deleteConfirm.full_name}) будет удалён.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
