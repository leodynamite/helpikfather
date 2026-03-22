-- Миграция: панель администратора (выполнить в Supabase → SQL Editor, если проект уже создан)
-- После выполнения назначьте себя админом (см. конец файла).

alter table public.user_settings
  add column if not exists is_admin boolean default false not null;

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
on public.orders for select
using (
  exists (
    select 1 from public.user_settings us
    where us.user_id = auth.uid()
      and coalesce(us.is_admin, false) = true
  )
);

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
on public.order_items for select
using (
  exists (
    select 1 from public.user_settings us
    where us.user_id = auth.uid()
      and coalesce(us.is_admin, false) = true
  )
);

drop policy if exists "Admins can view all user settings" on public.user_settings;
create policy "Admins can view all user settings"
on public.user_settings for select
using (
  exists (
    select 1 from public.user_settings us
    where us.user_id = auth.uid()
      and coalesce(us.is_admin, false) = true
  )
);

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

-- Назначить администратора: Authentication → Users → скопировать UUID пользователя
-- update public.user_settings set is_admin = true where user_id = 'ВАШ_UUID';
-- insert into public.user_settings (user_id, shop_name, is_admin)
--   values ('ВАШ_UUID', 'Админ', true)
--   on conflict (user_id) do update set is_admin = excluded.is_admin;
