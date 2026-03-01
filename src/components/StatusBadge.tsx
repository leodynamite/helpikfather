import type { OrderStatus } from '../types/order'

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  new: { label: 'Новый', className: 'bg-blue-100 text-blue-800' },
  ordered: { label: 'Заказан', className: 'bg-amber-100 text-amber-800' },
  received: { label: 'Получен', className: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Выполнен', className: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Отменён', className: 'bg-red-100 text-red-800' },
}

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' }
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
