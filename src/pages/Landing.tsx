import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export function Landing() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/app', { replace: true })
      } else {
        setChecking(false)
      }
    })
  }, [navigate])

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <p className="text-sm text-gray-500">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              P
            </div>
            <div>
              <div className="text-sm font-semibold tracking-tight">PartsDesk</div>
              <div className="text-[11px] text-gray-500">Стол заказов автозапчастей</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-4 text-xs text-gray-600">
            <a href="#how" className="hover:text-gray-900">
              Как работает
            </a>
            <a href="#features" className="hover:text-gray-900">
              Возможности
            </a>
            <a href="#for" className="hover:text-gray-900">
              Для кого
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-gray-700 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-sm"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        <section className="grid md:grid-cols-2 gap-10 items-center mb-16" id="top">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1 text-[11px] text-blue-700 mb-4">
              Для столов заказов автозапчастей
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
              Все заказы по запчастям
              <br />
              в одном понятном столе
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-6 max-w-xl">
              PartsDesk помогает быстро принимать заявки от клиентов, фиксировать детали, суммы и статус заказа. По
              ощущениям — как привычный бумажный бланк, только аккуратнее и без потерянных листов.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 shadow-sm"
              >
                Начать бесплатно за 1 минуту
              </Link>
              <Link
                to="/login"
                className="text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Уже есть аккаунт
              </Link>
            </div>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Учёт заказов, статусов и сумм без Excel.</li>
              <li>• Двойной бланк для печати: клиент + магазин.</li>
              <li>• Быстрый повтор заказа и поиск по телефону.</li>
            </ul>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-gray-800">Живой стол заказов</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 border border-emerald-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Онлайн
                </span>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                <div className="grid grid-cols-3 border-b border-gray-200 bg-white text-[10px] text-gray-500">
                  <div className="px-2 py-1.5">Сегодня</div>
                  <div className="px-2 py-1.5 border-l border-gray-200">Всего заказов</div>
                  <div className="px-2 py-1.5 border-l border-gray-200 text-right">Сумма</div>
                </div>
                <div className="grid grid-cols-3 text-[13px] text-gray-900">
                  <div className="px-2 py-2">5</div>
                  <div className="px-2 py-2 border-l border-gray-200">1 246</div>
                  <div className="px-2 py-2 border-l border-gray-200 text-right">3 580 900 ₽</div>
                </div>
              </div>
              <div className="mt-4 text-[11px] text-gray-600">
                Любой заказ можно найти по ФИО, телефону или машине, поменять статус, распечатать двойной бланк или
                повторить в один клик.
              </div>
            </div>
          </div>
        </section>

        <section id="how" className="mb-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Как работает PartsDesk</h2>
          <p className="text-sm text-gray-600 mb-4">
            Логика такая же, как у бумажных бланков, только быстрее и аккуратнее. Для менеджера за столом это три
            простых шага:
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-800">
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold mb-2">1. Приняли звонок</div>
              <p className="text-gray-700 mb-1">Записали ФИО, телефон, машину и запчасти в одну форму.</p>
              <p className="text-gray-500">Не нужно искать ручку и чистый бланк — всё открывается за пару кликов.</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold mb-2">2. Оформляем заказ</div>
              <p className="text-gray-700 mb-1">
                Меняем статус, печатаем двойной бланк: одна копия клиенту, вторая — в папку магазина.
              </p>
              <p className="text-gray-500">Шапка бланка и подпись исполнителя настраиваются в разделе «Настройки».</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-sm font-semibold mb-2">3. Клиент вернулся</div>
              <p className="text-gray-700 mb-1">Находим по телефону, нажимаем «Повторить» — заказ готов.</p>
              <p className="text-gray-500">Вся история по клиенту сохраняется, ничего не теряется.</p>
            </div>
          </div>
        </section>

        <section id="features" className="mb-16">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Что уже умеет PartsDesk</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <ul className="space-y-1">
              <li>• Отдельные базы заказов для каждого пользователя (Supabase Auth + RLS).</li>
              <li>• Статусы заказов: новый, заказан, получен, выполнен, отменён.</li>
              <li>• Поиск по ФИО и машине плюс отдельный быстрый поиск по телефону.</li>
              <li>• Быстрый повтор заказа на основе уже существующего.</li>
            </ul>
            <ul className="space-y-1">
              <li>• Двойной печатный бланк с настраиваемым названием магазина и исполнителем.</li>
              <li>• Экспорт заказов в Excel (CSV) для отчётности и выгрузок.</li>
              <li>• Личный кабинет настроек шапки бланка (название, адрес, телефон, исполнитель).</li>
              <li>• Мини-дашборд с количеством заказов и общей суммой.</li>
            </ul>
          </div>
        </section>

        <section id="for" className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Кому подойдёт</h2>
          <p className="text-sm text-gray-600 mb-3">
            В первую очередь — для небольших магазинов и одиночных мастеров, которые сейчас ведут заказы в блокноте
            или россыпью бумажных бланков.
          </p>
          <ul className="text-sm text-gray-700 space-y-1 mb-4">
            <li>• Стол заказов автозапчастей.</li>
            <li>• Небольшие СТО, которые заказывают запчасти под ремонт.</li>
            <li>• Частные мастера, которым важно хранить историю клиентов.</li>
          </ul>
        </section>

        <section className="border-t border-gray-200 pt-6 text-sm text-gray-700">
          <h2 className="text-base font-semibold mb-2">Что дальше</h2>
          <p className="mb-2">
            Дай отцу поработать 3–5 дней в PartsDesk. После этого можно будет добавить историю клиента, тарифы,
            нескольких сотрудников и превратить систему в полноценный SaaS.
          </p>
          <p className="text-xs text-gray-500">
            Уже сейчас можно регистрироваться и использовать PartsDesk бесплатно. Для начала достаточно нажать
            «Зарегистрироваться» вверху страницы.
          </p>
        </section>
      </main>
    </div>
  )
}


