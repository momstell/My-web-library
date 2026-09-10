-- 내 소장도서관 v2.0 클라우드 동기화용
create table if not exists public.library_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  books jsonb not null default '[]'::jsonb,
  version integer not null default 2,
  updated_at timestamptz not null default now()
);

alter table public.library_state enable row level security;

grant select, insert, update, delete on table public.library_state to authenticated;

-- 같은 이름의 정책이 있으면 다시 만들 수 있도록 정리
 drop policy if exists "library_state_select_own" on public.library_state;
 drop policy if exists "library_state_insert_own" on public.library_state;
 drop policy if exists "library_state_update_own" on public.library_state;
 drop policy if exists "library_state_delete_own" on public.library_state;

create policy "library_state_select_own"
on public.library_state for select
to authenticated
using (auth.uid() = user_id);

create policy "library_state_insert_own"
on public.library_state for insert
to authenticated
with check (auth.uid() = user_id);

create policy "library_state_update_own"
on public.library_state for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "library_state_delete_own"
on public.library_state for delete
to authenticated
using (auth.uid() = user_id);
