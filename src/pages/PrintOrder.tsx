import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { supabase } from '../lib/supabaseClient'
import type { Order } from '../types/order'

function OrderSlip({ order, copyLabel }: { order: Order; copyLabel: string }) {
  const formattedDate = format(new Date(order.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })
  const total = Number(order.total_price).toLocaleString('ru-RU')

  return (
    <div className="border border-black p-4 text-xs leading-relaxed break-inside-avoid">
      <div className="flex justify-between items-center mb-1">
        <div className="font-semibold">Стол заказов запчастей м-н «PartsDesk»</div>
        <div className="text-[10px] italic text-gray-700">{copyLabel}</div>
      </div>
      <div className="text-[11px] mb-2">
        г. ____________, ул. ______________________ тел. ______________________
      </div>

      <div className="flex justify-between items-baseline mb-2 text-[11px]">
        <div>
          Бланк заказа № <span className="font-semibold">{order.order_number}</span> от{' '}
          <span className="font-semibold">{formattedDate}</span>
        </div>
      </div>

      <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1 text-[11px] mb-3">
        <div className="font-semibold">Заказчик:</div>
        <div className="whitespace-pre-wrap">{order.full_name}</div>
        <div className="font-semibold">Контактный телефон:</div>
        <div>{order.phone || '—'}</div>
        <div className="font-semibold">Автомобиль:</div>
        <div className="whitespace-pre-wrap">{order.car_model}</div>
        <div className="font-semibold">Двигатель:</div>
        <div className="whitespace-pre-wrap">{order.engine || '—'}</div>
      </div>

      <div className="mt-2 mb-1 font-semibold text-[11px]">Список заказанных запчастей</div>
      <table className="w-full border border-black border-collapse text-[11px] mb-2">
        <thead>
          <tr>
            <th className="border border-black px-1 py-0.5 w-24 text-left">Код детали</th>
            <th className="border border-black px-1 py-0.5 text-left">Название детали</th>
            <th className="border border-black px-1 py-0.5 w-10 text-right">Кол-во</th>
            <th className="border border-black px-1 py-0.5 w-16 text-right">Цена</th>
            <th className="border border-black px-1 py-0.5 w-20 text-right">Сумма (р.)</th>
          </tr>
        </thead>
        <tbody>
          <tr className="align-top">
            <td className="border border-black px-1 py-0.5 align-top text-gray-500">—</td>
            <td className="border border-black px-1 py-0.5 whitespace-pre-wrap">{order.parts}</td>
            <td className="border border-black px-1 py-0.5 text-right">—</td>
            <td className="border border-black px-1 py-0.5 text-right">—</td>
            <td className="border border-black px-1 py-0.5 text-right">{total}</td>
          </tr>
        </tbody>
      </table>

      <div className="flex justify-between text-[11px] mb-1">
        <div>
          Оплачено: <span className="font-semibold">{total} р</span>
        </div>
        <div>
          Долг по оплате: <span className="font-semibold">0,00 р</span>
        </div>
      </div>

      <div className="mt-4 flex justify-between text-[11px]">
        <div>
          Клиент согласен: _____________________
          <div className="text-[10px] mt-1 text-gray-600">(подпись заказчика)</div>
        </div>
        <div className="text-right">
          Исполнитель: _____________________
          <div className="text-[10px] mt-1 text-gray-600">(подпись исполнителя)</div>
        </div>
      </div>
    </div>
  )
}

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
    }, 400)
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
      <div className="max-w-4xl mx-auto py-4 px-4 print:p-4 space-y-4">
        <OrderSlip order={order} copyLabel="Экземпляр для клиента" />
        <OrderSlip order={order} copyLabel="Экземпляр для магазина" />
      </div>
    </div>
  )
}


