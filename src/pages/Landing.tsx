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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <p className="text-sm text-slate-300">Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-500/10 via-sky-400/5 to-teal-400/10" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#38bdf822,_transparent_60%),radial-gradient(circle_at_bottom,_#0ea5e922,_transparent_60%)]" />

      <header className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-400 flex items-center justify-center text-xs font-bold">
            P
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">PartsDesk</div>
            <div className="text-[11px] text-slate-400">Стол заказов автозапчастей</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-slate-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800/70"
          >
            Войти
          </Link>
          <Link
            to="/register"
            className="text-sm px-4 py-2 rounded-lg bg-sky-500 text-white font-medium hover:bg-sky-400 shadow-sm shadow-sky-500/40"
          >
            Зарегистрироваться
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        <section className="grid md:grid-cols-2 gap-10 items-center mb-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 border border-sky-500/40 px-3 py-1 text-[11px] text-sky-200 mb-4">
              Для столов заказов автозапчастей
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-50 mb-4">
              Все заказы по запчастям
              <br />
              в одном простом столе
            </h1>
            <p className="text-sm md:text-base text-slate-300 mb-6 max-w-xl">
              PartsDesk помогает быстро принимать заявки от клиентов, фиксировать детали, суммы и статус заказа.
              Ничего лишнего — только то, чем реально пользуется менеджер за столом.
            </p>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-lg bg-sky-500 text-white text-sm font-medium hover:bg-sky-400 shadow-sm shadow-sky-500/40"
              >
                Начать бесплатно за 1 минуту
              </Link>
              <Link
                to="/login"
                className="text-sm text-slate-200 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-900/60"
              >
                Уже есть аккаунт
              </Link>
            </div>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>• Учёт заказов, статусов и сумм</li>
              <li>• Двойной бланк для печати (клиент + магазин)</li>
              <li>• Быстрый повтор заказа и поиск по телефону</li>
            </ul>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-sky-500/20 blur-2xl" />
            <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/80 backdrop-blur-md p-4 shadow-xl shadow-sky-900/40">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-medium text-slate-200">Живой стол заказов</div>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Онлайн
                </span>
              </div>
              <div className="rounded-xl border border-slate-700 bg-slate-950/60 overflow-hidden">
                <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-900/80 text-[10px] text-slate-300">
                  <div className="px-2 py-1.5">Сегодня</div>
                  <div className="px-2 py-1.5 border-l border-slate-800">Всего заказов</div>
                  <div className="px-2 py-1.5 border-l border-slate-800 text-right">Сумма</div>
                </div>
                <div className="grid grid-cols-3 text-[13px] text-slate-50">
                  <div className="px-2 py-2">5</div>
                  <div className="px-2 py-2 border-l border-slate-800">1 246</div>
                  <div className="px-2 py-2 border-l border-slate-800 text-right">3 580 900 ₽</div>
                </div>
              </div>
              <div className="mt-4 text-[11px] text-slate-300">
                Любой заказ можно найти по ФИО, телефону или машине, изменить статус, распечатать бланк или
                повторить в один клик.
              </div>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-4 text-xs text-slate-200">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-sm font-semibold mb-2">1. Приняли звонок</div>
            <p className="text-slate-300 mb-1">Быстро записали ФИО, телефон, машину и список запчастей.</p>
            <p className="text-slate-500">Не нужно искать бумажку по столу — всё в одном месте.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-sm font-semibold mb-2">2. Сделали заказ</div>
            <p className="text-slate-300 mb-1">Поменяли статус, распечатали бланк и отдали клиенту.</p>
            <p className="text-slate-500">Две копии: клиентская и для магазина.</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="text-sm font-semibold mb-2">3. Вернулся клиент</div>
            <p className="text-slate-300 mb-1">Нашли по телефону, нажали «Повторить» — готово.</p>
            <p className="text-slate-500">История заказов остаётся у вас.</p>
          </div>
        </section>
      </main>
    </div>
  )
}

