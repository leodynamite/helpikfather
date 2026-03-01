import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Order } from '../types/order'
import { StatusBadge } from './StatusBadge'
import { generateOrderPdf } from '../utils/generatePdf'

interface OrderTableProps {
  orders: Order[]
  onDelete: (order: Order) => void
}

export function OrderTable({ orders, onDelete }: OrderTableProps) {
  function handlePrint(order: Order) {
    generateOrderPdf(order)
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">№</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ФИО</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Телефон</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Машина</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_number}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {format(new Date(order.created_at), 'dd.MM.yyyy', { locale: ru })}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">{order.full_name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{order.phone || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{order.car_model}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.total_price} ₽</td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handlePrint(order)}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    PDF
                  </button>
                  <Link
                    to={`/orders/${order.id}/edit`}
                    className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg"
                  >
                    Изменить
                  </Link>
                  <button
                    onClick={() => onDelete(order)}
                    className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg"
                  >
                    Удалить
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="px-4 py-12 text-center text-gray-500">
          Заказов пока нет. Создайте первый заказ.
        </div>
      )}
    </div>
  )
}
