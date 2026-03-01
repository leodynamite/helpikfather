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
  status?: OrderStatus
}

export interface OrderUpdate {
  full_name?: string
  phone?: string
  car_model?: string
  engine?: string
  parts?: string
  total_price?: number
  status?: OrderStatus
}
