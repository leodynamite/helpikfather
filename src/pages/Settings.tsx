import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Navbar } from '../components/Navbar'
import type { UserSettings } from '../types/userSettings'

export function Settings() {
  const [, setSettings] = useState<UserSettings | null>(null)
  const [shopName, setShopName] = useState('')
  const [shopAddress, setShopAddress] = useState('')
  const [shopPhone, setShopPhone] = useState('')
  const [executorName, setExecutorName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) throw new Error('Не авторизован')

        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()

        if (error) throw error
        if (data) {
          const s = data as UserSettings
          setSettings(s)
          setShopName(s.shop_name ?? '')
          setShopAddress(s.shop_address ?? '')
          setShopPhone(s.shop_phone ?? '')
          setExecutorName(s.executor_name ?? '')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки настроек')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Не авторизован')

      const payload = {
        user_id: user.id,
        shop_name: shopName.trim() || null,
        shop_address: shopAddress.trim() || null,
        shop_phone: shopPhone.trim() || null,
        executor_name: executorName.trim() || null,
      }

      const { data, error } = await supabase
        .from('user_settings')
        .upsert(payload, { onConflict: 'user_id' })
        .select('*')
        .single()

      if (error) throw error
      setSettings(data as UserSettings)
      setMessage('Настройки сохранены')
      setTimeout(() => setMessage(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения настроек')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Настройки магазина</h1>

        {loading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {message && <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}

            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                Название магазина
              </label>
              <input
                id="shopName"
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder='Например: "Автомаг"'
              />
            </div>

            <div>
              <label htmlFor="shopAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Адрес (для шапки бланка)
              </label>
              <input
                id="shopAddress"
                type="text"
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder='Например: г. Мирный, ул. Вилюйская д.10/2'
              />
            </div>

            <div>
              <label htmlFor="shopPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Телефон магазина
              </label>
              <input
                id="shopPhone"
                type="text"
                value={shopPhone}
                onChange={(e) => setShopPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+7..."
              />
            </div>

            <div>
              <label htmlFor="executorName" className="block text-sm font-medium text-gray-700 mb-1">
                Имя исполнителя (по умолчанию в бланке)
              </label>
              <input
                id="executorName"
                type="text"
                value={executorName}
                onChange={(e) => setExecutorName(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ФИО или кратко, как подписывает отец"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

