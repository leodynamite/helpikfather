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

-- Позиции в заказе
create table if not exists order_items (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp default now(),
  order_id uuid references orders on delete cascade not null,
  item_name text not null,
  quantity numeric not null default 1,
  unit_price numeric not null,
  line_total numeric not null
);

alter table order_items enable row level security;

create policy "Users can view own order items"
on order_items for select
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can insert own order items"
on order_items for insert
with check (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can update own order items"
on order_items for update
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "Users can delete own order items"
on order_items for delete
using (
  exists (
    select 1
    from orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
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
  executor_name text,
  is_admin boolean default false not null
);

alter table user_settings enable row level security;

create policy "Users can view own settings"
on user_settings for select
using (auth.uid() = user_id);

create policy "Users can upsert own settings"
on user_settings for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins can view all user settings"
on user_settings for select
using (
  exists (
    select 1 from user_settings us
    where us.user_id = auth.uid()
      and coalesce(us.is_admin, false) = true
  )
);

-- Админ: просмотр всех заказов и позиций
create policy "Admins can view all orders"
on orders for select
using (
  exists (
    select 1 from user_settings us
    where us.user_id = auth.uid()
      and coalesce(us.is_admin, false) = true
  )
);

create policy "Admins can view all order items"
on order_items for select
using (
  exists (
    select 1 from user_settings us
    where us.user_id = auth.uid()
      and coalesce(us.is_admin, false) = true
  )
);

-- Сводка по всем пользователям (только для is_admin)
create or replace function public.admin_users_overview()
returns table (
  user_id uuid,
  email text,
  shop_name text,
  orders_count bigint,
  total_sales numeric,
  total_paid numeric,
  total_debt numeric,
  last_order_at timestamptz,
  registered_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.user_settings s
    where s.user_id = auth.uid()
      and coalesce(s.is_admin, false) = true
  ) then
    raise exception 'admin_only' using errcode = 'P0001';
  end if;

  return query
  select
    u.id,
    coalesce(u.email, '')::text,
    coalesce(us.shop_name, '')::text,
    count(o.id)::bigint,
    coalesce(sum(o.total_price), 0)::numeric,
    coalesce(sum(o.paid_amount), 0)::numeric,
    coalesce(sum(greatest(o.total_price - coalesce(o.paid_amount, 0), 0)), 0)::numeric,
    max(o.created_at),
    u.created_at
  from auth.users u
  left join public.user_settings us on us.user_id = u.id
  left join public.orders o on o.user_id = u.id
  group by u.id, u.email, u.created_at, us.shop_name
  order by u.created_at desc;
end;
$$;

revoke all on function public.admin_users_overview() from public;
grant execute on function public.admin_users_overview() to authenticated;

-- Как назначить себя админом (выполнить в SQL Editor с подставленным user_id из Auth → Users):
-- update public.user_settings set is_admin = true where user_id = 'ВАШ_UUID';
-- Если строки настроек ещё нет:
-- insert into public.user_settings (user_id, shop_name, is_admin) values ('ВАШ_UUID', 'Админ', true);

