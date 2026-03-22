export interface UserSettings {
  id: string
  user_id: string
  shop_name: string | null
  shop_address: string | null
  shop_phone: string | null
  executor_name: string | null
  /** Только чтение; выставляется в Supabase SQL, не через форму настроек */
  is_admin?: boolean | null
}

