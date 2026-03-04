export type OrderStatus = 'new' | 'ordered' | 'received' | 'completed' | 'cancelled'

export interface Order {
  id: string
  created_at: string
  user_id: string
  order_number: number
  full_name: string
  phone: string | null
  car_model: string
  engine: string | null
  parts: string
  total_price: number
  paid_amount: number
  expected_date: string | null
  reminder_note: string | null
  vin: string | null
  photo_url: string | null
  status: OrderStatus
}

export interface OrderInsert {
  user_id: string
  full_name: string
  phone?: string
  car_model: string
  engine?: string
  parts: string
  total_price: number
  paid_amount?: number
  expected_date?: string | null
  reminder_note?: string | null
  vin?: string | null
  photo_url?: string | null
  status?: OrderStatus
}

export interface OrderUpdate {
  full_name?: string
  phone?: string
  car_model?: string
  engine?: string
  parts?: string
  total_price?: number
  paid_amount?: number
  expected_date?: string | null
  reminder_note?: string | null
  vin?: string | null
  photo_url?: string | null
  status?: OrderStatus
}
