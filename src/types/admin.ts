/** Строка из RPC admin_users_overview() */
export interface AdminUserOverviewRow {
  user_id: string
  email: string
  shop_name: string
  orders_count: number
  total_sales: number
  total_paid: number
  total_debt: number
  last_order_at: string | null
  registered_at: string
}
