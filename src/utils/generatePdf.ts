import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Order } from '../types/order'

export function generateOrderPdf(order: Order): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  let y = 20

  // Заголовок
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Заказ автозапчастей', pageWidth / 2, y, { align: 'center' })
  y += 15

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const lineHeight = 8
  const labelWidth = 50
  const valueStart = margin + labelWidth + 5

  const addLine = (label: string, value: string | number) => {
    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(value), valueStart, y)
    y += lineHeight
  }

  addLine('Номер заказа', order.order_number)
  addLine('Дата', format(new Date(order.created_at), 'dd.MM.yyyy HH:mm', { locale: ru }))
  addLine('ФИО', order.full_name)
  addLine('Телефон', order.phone || '—')
  addLine('Машина', order.car_model)
  addLine('Двигатель', order.engine || '—')
  addLine('Запчасти', order.parts)
  addLine('Стоимость', `${order.total_price} ₽`)

  y += 15

  doc.setFont('helvetica', 'normal')
  doc.text('Подпись клиента: _______________________', margin, y)
  y += lineHeight
  doc.text('Подпись менеджера: _____________________', margin, y)

  doc.save(`order-${order.order_number}.pdf`)
}
