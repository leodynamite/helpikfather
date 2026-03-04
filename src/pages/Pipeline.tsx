import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import type { Order, OrderStatus } from '../types/order'

type ColumnId = OrderStatus

const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: 'new', title: 'Новый' },
  { id: 'ordered', title: 'Заказан' },
  { id: 'received', title: 'Получен' },
  { id: 'completed', title: 'Выполнен' },
  { id: 'cancelled', title: 'Отменён' },
]

export function Pipeline() {
  const [orders, setOrders] = useState<Order[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setOrders((data || []) as Order[])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function handleDragStart(id: string) {
    setDraggingId(id)
  }

  function handleDragEnd() {
    setDraggingId(null)
  }

  function handleDrop(status: ColumnId) {
    if (!draggingId) return
    const order = orders.find((o) => o.id === draggingId)
    if (!order || order.status === status) {
      setDraggingId(null)
      return
    }

    const prevStatus = order.status
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status } : o)),
    )
    setDraggingId(null)

    ;(async () => {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', order.id)
      if (error) {
        // откат при ошибке
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: prevStatus } : o)),
        )
      }
    })()
  }

  const grouped: Record<ColumnId, Order[]> = {
    new: [],
    ordered: [],
    received: [],
    completed: [],
    cancelled: [],
  }
  for (const o of orders) {
    grouped[o.status]?.push(o)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Воронка заказов</h1>
        </div>
        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {COLUMNS.map((col) => (
              <div key={col.id} className="flex flex-col bg-gray-100 rounded-xl border border-gray-200 min-h-[200px]">
                <div className="px-3 py-2 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
                  {col.title} ({grouped[col.id].length})
                </div>
                <div
                  className="flex-1 px-2 py-2 space-y-2"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    handleDrop(col.id)
                  }}
                >
                  {grouped[col.id].map((order) => (
                    <div
                      key={order.id}
                      draggable
                      onDragStart={() => handleDragStart(order.id)}
                      onDragEnd={handleDragEnd}
                      className={`rounded-lg bg-white border px-3 py-2 text-xs cursor-move shadow-sm ${
                        draggingId === order.id ? 'opacity-70 border-blue-400' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-gray-800">№{order.order_number}</span>
                        <span className="text-gray-500">
                          {new Date(order.created_at).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <div className="text-gray-800 truncate">{order.full_name}</div>
                      <div className="text-gray-500 truncate text-[11px]">{order.car_model}</div>
                      <div className="mt-1 text-gray-900 text-xs font-semibold">
                        {Number(order.total_price || 0).toLocaleString('ru-RU')} ₽
                      </div>
                    </div>
                  ))}
                  {grouped[col.id].length === 0 && (
                    <div className="text-[11px] text-gray-400 text-center py-4">Нет заказов</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

