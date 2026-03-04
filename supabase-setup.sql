-- Таблица заказов
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
  paid_amount numeric default 0 not null,
  expected_date date,
  reminder_note text,
  vin text,
  photo_url text,
  status text default 'new'
);

-- Row Level Security
alter table orders enable row level security;

create policy "Users can view own orders"
on orders for select
using (auth.uid() = user_id);

create policy "Users can insert own orders"
on orders for insert
with check (auth.uid() = user_id);

create policy "Users can update own orders"
on orders for update
using (auth.uid() = user_id);

create policy "Users can delete own orders"
on orders for delete
using (auth.uid() = user_id);

-- Настройки магазина для пользователя
create table if not exists user_settings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  shop_name text,
  shop_address text,
  shop_phone text,
  executor_name text
);

alter table user_settings enable row level security;

create policy "Users can view own settings"
on user_settings for select
using (auth.uid() = user_id);

create policy "Users can upsert own settings"
on user_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

