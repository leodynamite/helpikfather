# PartsDesk — Стол заказов автозапчастей

Веб-приложение для учёта заказов автозапчастей. MVP v1.

## Технологии

- React + Vite
- TypeScript
- TailwindCSS
- Supabase (Auth + Database)
- jsPDF, date-fns

## Установка

```bash
npm install
```

## Настройка .env

Создайте файл `.env` в корне проекта:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Значения возьмите в [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект → Settings → API.

## База данных (Supabase)

Выполните SQL в Supabase SQL Editor (файл `supabase-setup.sql`):

```sql
create table orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now(),
  user_id uuid references auth.users not null,
  order_number bigserial,
  full_name text not null,
  phone text,
  car_model text not null,
  engine text,
  parts text not null,
  total_price numeric not null,
  status text default 'new'
);

alter table orders enable row level security;

create policy "Users can view own orders"
on orders for select using (auth.uid() = user_id);

create policy "Users can insert own orders"
on orders for insert with check (auth.uid() = user_id);

create policy "Users can update own orders"
on orders for update using (auth.uid() = user_id);

create policy "Users can delete own orders"
on orders for delete using (auth.uid() = user_id);
```

## Запуск

```bash
npm run dev
```

Откройте http://localhost:5173

## Сборка

```bash
npm run build
```

## Функционал

- Регистрация и вход (email + пароль)
- Dashboard: статистика, таблица заказов, поиск, фильтр по статусу, сортировка
- Создание заказа
- Редактирование заказа
- Удаление заказа (с подтверждением)
- Печать PDF

## Безопасность

- RLS: пользователь видит только свои заказы
- Все запросы через Supabase client
