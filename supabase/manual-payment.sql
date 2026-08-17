-- Plickify Academy — Manual payment (bKash/Nagad) support
-- Run once in Supabase SQL editor.
alter table public.orders
  add column if not exists payment_method text;

alter table public.orders
  add column if not exists trx_id text;

alter table public.orders
  add column if not exists coupon_id text;

create index if not exists orders_status_idx
  on public.orders (status);