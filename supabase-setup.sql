-- Run this in your Supabase SQL editor (https://qnapwukqhybziduhzpow.supabase.co)

create table if not exists public.validate (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  email text not null,
  issued_for text not null,
  issued_date date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists validate_code_idx on public.validate (code);

alter table public.validate enable row level security;

-- Anyone (anon) can verify a certificate by code (read-only, single row lookups)
drop policy if exists "Public can read validate" on public.validate;
create policy "Public can read validate"
  on public.validate for select
  to anon, authenticated
  using (true);

-- Only the admin (jagrit@zuup.dev) can insert / update / delete
drop policy if exists "Admin can insert" on public.validate;
create policy "Admin can insert"
  on public.validate for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'jagrit@zuup.dev');

drop policy if exists "Admin can update" on public.validate;
create policy "Admin can update"
  on public.validate for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'jagrit@zuup.dev')
  with check (auth.jwt() ->> 'email' = 'jagrit@zuup.dev');

drop policy if exists "Admin can delete" on public.validate;
create policy "Admin can delete"
  on public.validate for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'jagrit@zuup.dev');
