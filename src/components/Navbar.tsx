import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function Navbar() {
  const navigate = useNavigate()

  async function handleSignOut() {
    try {
      await supabase.auth.signOut()
      navigate('/login')
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/app" className="text-xl font-bold text-gray-800 hover:text-gray-600">
            PartsDesk
          </Link>
          <Link to="/settings" className="text-sm text-gray-600 hover:text-gray-900">
            Настройки
          </Link>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Выйти
        </button>
      </div>
    </nav>
  )
}

