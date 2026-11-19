# budong web

移动端优先的网页版，Vite + React + TypeScript，数据先写本地，登录后与 Supabase 同步。

```bash
npm install
npm run packs     # 把 ../packs/*.json 同步进来（predev/prebuild 会自动跑）
npm run dev
npm run build
```

配置云端：复制 `.env.example` 为 `.env.local`，填 Supabase 的 URL 与 anon key。

```bash
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

没有配置时，应用仍可离线使用，只少了账号与同步。

## 数据库

在 Supabase SQL Editor 里执行：

```sql
create table books (
  user_id    uuid not null references auth.users on delete cascade,
  book_id    text not null,
  payload    jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

alter table books enable row level security;

create policy "own rows" on books
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 目录

```
src/
├── App.tsx          外壳与页签
├── data/            types / packs / store / vocab / sync
├── lib/supabase.ts  客户端与登录
└── views/           Shelf / Notes / Vocab / Account
```
