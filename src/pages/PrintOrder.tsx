import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { supabase } from '../lib/supabaseClient'
import type { Order } from '../types/order'

export function PrintOrder() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    async function load() {
      const { data, error } = await supabase.from('orders').select('*').eq('id', id).single()
      if (error) {
        setError('Заказ не найден')
      } else {
        setOrder(data as Order)
      }
    }

    load()
  }, [id])

  useEffect(() => {
    if (!order) return
    const t = setTimeout(() => {
      window.print()
    }, 300)
    return () => clearTimeout(t)
  }, [order])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-3xl mx-auto p-8 print:p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Заказ автозапчастей</h1>

        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="w-40 font-semibold">Номер заказа:</span>
            <span>{order.order_number}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-40 font-semibold">Дата:</span>
            <span>{format(new Date(order.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-40 font-semibold">ФИО:</span>
            <span className="whitespace-pre-wrap">{order.full_name}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-40 font-semibold">Телефон:</span>
            <span>{order.phone || '—'}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-40 font-semibold">Машина:</span>
            <span className="whitespace-pre-wrap">{order.car_model}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-40 font-semibold">Двигатель:</span>
            <span className="whitespace-pre-wrap">{order.engine || '—'}</span>
          </div>
          <div className="flex gap-2 items-start">
            <span className="w-40 font-semibold">Запчасти:</span>
            <span className="whitespace-pre-wrap flex-1">{order.parts}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <span className="w-40 font-semibold">Стоимость:</span>
            <span>{Number(order.total_price).toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

        <div className="mt-12 flex justify-between text-sm">
          <div>
            <div>Подпись клиента: ____________________________</div>
          </div>
          <div>
            <div>Подпись менеджера: __________________________</div>
          </div>
        </div>
      </div>
    </div>
  )
}

