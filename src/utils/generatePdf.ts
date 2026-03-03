import { jsPDF } from 'jspdf'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Order } from '../types/order'

export function generateOrderPdf(order: Order): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  let y = 25

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Заказ автозапчастей', pageWidth / 2, y, { align: 'center' })
  y += 18

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')

  const lineHeight = 7
  const labelWidth = 45
  const valueStart = margin + labelWidth + 4
  const maxValueWidth = pageWidth - margin - valueStart

  const ensureSpace = (neededLines = 1) => {
    if (y + neededLines * lineHeight > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  const addLine = (label: string, value: string | number) => {
    const text = String(value || '')
    const wrapped = doc.splitTextToSize(text, maxValueWidth)
    const lines = Array.isArray(wrapped) ? wrapped : [wrapped]

    ensureSpace(lines.length)

    doc.setFont('helvetica', 'bold')
    doc.text(`${label}:`, margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(lines as string[], valueStart, y)

    y += lineHeight * lines.length
  }

  addLine('Номер заказа', order.order_number)
  addLine('Дата', format(new Date(order.created_at), 'dd.MM.yyyy HH:mm', { locale: ru }))
  addLine('ФИО', order.full_name)
  addLine('Телефон', order.phone || '—')
  addLine('Машина', order.car_model)
  addLine('Двигатель', order.engine || '—')
  addLine('Запчасти', order.parts)
  addLine('Стоимость', `${Number(order.total_price).toLocaleString('ru-RU')} ₽`)

  y += 18
  ensureSpace(2)

  doc.setFont('helvetica', 'normal')
  doc.text('Подпись клиента: ____________________________', margin, y)
  y += lineHeight + 3
  doc.text('Подпись менеджера: _________________________', margin, y)

  doc.save(`order-${order.order_number}-partsdesk.pdf`)
}
