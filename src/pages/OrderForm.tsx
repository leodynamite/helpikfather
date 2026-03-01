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
        status,
      })

      if (error) throw error
      navigate('/', { state: { orderCreated: true } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения')
    } finally {
      setLoading(false)
    }
  }

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
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
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
              <input
                id="carModel"
                type="text"
                value={carModel}
                onChange={(e) => setCarModel(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="engine" className="block text-sm font-medium text-gray-700 mb-1">
                Двигатель
              </label>
              <input
                id="engine"
                type="text"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
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
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
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
