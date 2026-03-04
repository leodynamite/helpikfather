import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import type { OrderStatus } from '../types/order'

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'new', label: 'Новый' },
  { value: 'ordered', label: 'Заказан' },
  { value: 'received', label: 'Получен' },
  { value: 'completed', label: 'Выполнен' },
  { value: 'cancelled', label: 'Отменён' },
]

export function OrderForm() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [carModel, setCarModel] = useState('')
  const [engine, setEngine] = useState('')
  const [parts, setParts] = useState('')
  const [totalPrice, setTotalPrice] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [expectedDate, setExpectedDate] = useState('')
  const [reminderNote, setReminderNote] = useState('')
  const [status, setStatus] = useState<OrderStatus>('new')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const price = parseFloat(totalPrice.replace(',', '.'))
    if (isNaN(price) || price < 0) {
      setError('Введите корректную стоимость')
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Не авторизован')

      const { error } = await supabase.from('orders').insert({
        user_id: user.id,
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

      if (error) throw error
      navigate('/app', { state: { orderCreated: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

  const priceNumber = parseFloat(totalPrice.replace(',', '.')) || 0
  const paidNumber = parseFloat(paidAmount.replace(',', '.')) || 0
  const debt = Math.max(priceNumber - paidNumber, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Новый заказ</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <div className="space-y-4">
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
                Запчасти *
              </label>
              <textarea
                id="parts"
                value={parts}
                onChange={(e) => setParts(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-1">
                Стоимость *
              </label>
              <input
                id="totalPrice"
                type="text"
                value={totalPrice}
                onChange={(e) => setTotalPrice(e.target.value)}
                required
                placeholder="0"
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
              {loading ? 'Сохранение...' : 'Создать заказ'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
