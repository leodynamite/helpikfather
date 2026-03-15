import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import type { Order, OrderStatus, OrderItem, OrderItemInsert } from '../types/order'

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Новый' },
  { value: 'ordered', label: 'Заказан' },
  { value: 'received', label: 'Получен' },
  { value: 'completed', label: 'Выполнен' },
  { value: 'cancelled', label: 'Отменён' },
]

export function EditOrder() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [carModel, setCarModel] = useState('')
  const [engine, setEngine] = useState('')
  const [parts, setParts] = useState('')
  const [items, setItems] = useState<
    { id?: string; item_name: string; quantity: string; unit_price: string }[]
  >([])
  const [totalPrice, setTotalPrice] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [reminderNote, setReminderNote] = useState('')
  const [status, setStatus] = useState<OrderStatus>('new')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    async function load() {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
      if (error) {
        setError('Заказ не найден')
        return
      }
      setOrder(data)
      setFullName(data.full_name)
      setPhone(data.phone || '')
      setCarModel(data.car_model)
      setEngine(data.engine || '')
      setParts(data.parts)
      setTotalPrice(String(data.total_price))
      setPaidAmount(String(data.paid_amount ?? 0))
      setExpectedDate(data.expected_date ? data.expected_date.slice(0, 10) : '')
      setReminderNote(data.reminder_note || '')
      setStatus(data.status)

      // загружаем позиции заказа
      const { data: itemsData } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', data.id)
        .order('created_at', { ascending: true })

      if (itemsData && Array.isArray(itemsData)) {
        setItems(
          (itemsData as OrderItem[]).map((it) => ({
            id: it.id,
            item_name: it.item_name,
            quantity: String(it.quantity),
            unit_price: String(it.unit_price),
          })),
        )
      } else {
        setItems([{ item_name: '', quantity: '1', unit_price: '' }])
      }
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setError(null)
    setLoading(true)

    const parsedItems = items
      .map((it) => {
        const qty = parseFloat(it.quantity.replace(',', '.')) || 0
        const price = parseFloat(it.unit_price.replace(',', '.')) || 0
        const lineTotal = qty * price
        return {
          id: it.id,
          item_name: it.item_name.trim(),
          quantity: qty,
          unit_price: price,
          line_total: lineTotal,
        }
      })
      .filter((it) => it.item_name && it.quantity > 0 && it.unit_price >= 0)

    const priceFromItems = parsedItems.reduce((sum, it) => sum + it.line_total, 0)

    const price =
      totalPrice.trim() !== ''
        ? parseFloat(totalPrice.replace(',', '.'))
        : priceFromItems
    if (isNaN(price) || price < 0) {
      setError('Введите корректную стоимость (через позиции или вручную)')
      setLoading(false)
      return
    }

    const paid = paidAmount.trim()
      ? parseFloat(paidAmount.replace(',', '.'))
      : 0
    if (isNaN(paid) || paid < 0) {
      setError('Введите корректную сумму оплаты')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          full_name: fullName.trim(),
          phone: phone.trim() || null,
          car_model: carModel.trim(),
          engine: engine.trim() || null,
          parts: parts.trim(),
          total_price: price,
          paid_amount: paid,
          expected_date: expectedDate || null,
          reminder_note: reminderNote.trim() || null,
          status,
        })
        .eq('id', id)

      if (error) throw error

      // сохраняем позиции: простая стратегия — удалить старые и вставить новые
      const { error: deleteError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id)
      if (deleteError) throw deleteError

      if (parsedItems.length > 0) {
        const toInsert: OrderItemInsert[] = parsedItems.map((it) => ({
          order_id: id,
          item_name: it.item_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
          line_total: it.line_total,
        }))
        const { error: insertError } = await supabase.from('order_items').insert(toInsert)
        if (insertError) throw insertError
      }
      navigate('/app')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-6">
          {error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
          ) : (
            <p className="text-gray-500">Загрузка...</p>
          )}
        </main>
      </div>
    )
  }

  const priceFromItems = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity.replace(',', '.')) || 0
    const price = parseFloat(it.unit_price.replace(',', '.')) || 0
    return sum + qty * price
  }, 0)

  const priceNumber =
    (totalPrice.trim() !== '' ? parseFloat(totalPrice.replace(',', '.')) : priceFromItems) || 0
  const paidNumber = parseFloat(paidAmount.replace(',', '.')) || 0
  const debt = Math.max(priceNumber - paidNumber, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Редактирование заказа №{order.order_number}
        </h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Позиции заказа
              </label>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={item.id ?? index}
                    className="grid grid-cols-1 sm:grid-cols-[2fr,0.75fr,0.75fr,0.75fr,auto] gap-2 items-end"
                  >
                    <input
                      type="text"
                      placeholder="Название детали"
                      value={item.item_name}
                      onChange={(e) => {
                        const next = [...items]
                        next[index] = { ...next[index], item_name: e.target.value }
                        setItems(next)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Кол-во"
                      value={item.quantity}
                      onChange={(e) => {
                        const next = [...items]
                        next[index] = { ...next[index], quantity: e.target.value }
                        setItems(next)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Цена"
                      value={item.unit_price}
                      onChange={(e) => {
                        const next = [...items]
                        next[index] = { ...next[index], unit_price: e.target.value }
                        setItems(next)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <div className="text-sm text-gray-700">
                      {(
                        (parseFloat(item.quantity.replace(',', '.')) || 0) *
                        (parseFloat(item.unit_price.replace(',', '.')) || 0)
                      ).toFixed(2)} ₽
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (items.length === 1) {
                          setItems([{ item_name: '', quantity: '1', unit_price: '' }])
                        } else {
                          setItems(items.filter((_, i) => i !== index))
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  setItems([
                    ...items,
                    { item_name: '', quantity: '1', unit_price: '' },
                  ])
                }
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                + Добавить деталь
              </button>
            </div>
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                ФИО *
              </label>
              <textarea
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-1">
                Машина *
              </label>
              <textarea
                id="carModel"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                required
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-1">
                Двигатель
              </label>
              <textarea
                id="engine"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="parts" className="block text-sm font-medium text-gray-700 mb-1">
                Запчасти (общим текстом, не обязательно)
              </label>
              <textarea
                id="parts"
                value={parts}
                onChange={(e) => setParts(e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Стоимость (если пусто — считается из позиций)
              </label>
              <input
                id="totalPrice"
                type="text"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="paidAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Оплачено
              </label>
              <input
                id="paidAmount"
                type="text"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expectedDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Ожидаемая дата поставки
                </label>
                <input
                  id="expectedDate"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="reminderNote" className="block text-sm font-medium text-gray-700 mb-1">
                  Комментарий / напоминание
                </label>
                <input
                  id="reminderNote"
                  type="text"
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Например: позвонить при поступлении"
                />
              </div>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Статус
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700 border-t border-gray-100 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <div>Итог: <span className="font-semibold">{priceNumber || 0} ₽</span></div>
              <div>Оплачено: <span className="font-semibold">{paidNumber || 0} ₽</span></div>
              <div>
                Долг:{' '}
                <span className={debt > 0 ? 'font-semibold text-red-600' : 'font-semibold text-green-600'}>
                  {debt} ₽
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/app')}
              className="px-5 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
