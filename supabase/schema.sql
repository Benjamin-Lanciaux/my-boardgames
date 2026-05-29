-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- Table: games
-- Cache partagé des jeux BGG (pas de RLS)
-- ============================================================
create table if not exists games (
  id            uuid primary key default uuid_generate_v4(),
  bgg_id        integer not null unique,
  name          text not null,
  year          integer,
  image_url     text,
  thumbnail_url text,
  min_players   integer,
  max_players   integer,
  playing_time  integer, -- minutes
  created_at    timestamptz not null default now()
);

create index if not exists games_bgg_id_idx on games (bgg_id);

-- ============================================================
-- Table: collection_items
-- ============================================================
create table if not exists collection_items (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  game_id        uuid not null references games (id) on delete cascade,
  rating         integer check (rating between 1 and 10),
  last_played_at date,
  notes          text,
  added_at       timestamptz not null default now(),
  unique (user_id, game_id)
);

create index if not exists collection_items_user_id_idx      on collection_items (user_id);
create index if not exists collection_items_last_played_idx  on collection_items (last_played_at);

alter table collection_items enable row level security;

create policy "collection_items: user voit ses items"
  on collection_items for select
  using (auth.uid() = user_id);

create policy "collection_items: user insère ses items"
  on collection_items for insert
  with check (auth.uid() = user_id);

create policy "collection_items: user modifie ses items"
  on collection_items for update
  using (auth.uid() = user_id);

create policy "collection_items: user supprime ses items"
  on collection_items for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Table: categories
-- ============================================================
create table if not exists categories (
  id      uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name    text not null,
  color   text
);

alter table categories enable row level security;

create policy "categories: user voit ses catégories"
  on categories for select
  using (auth.uid() = user_id);

create policy "categories: user insère ses catégories"
  on categories for insert
  with check (auth.uid() = user_id);

create policy "categories: user modifie ses catégories"
  on categories for update
  using (auth.uid() = user_id);

create policy "categories: user supprime ses catégories"
  on categories for delete
  using (auth.uid() = user_id);

-- ============================================================
-- Table: collection_item_categories (many-to-many)
-- ============================================================
create table if not exists collection_item_categories (
  collection_item_id uuid not null references collection_items (id) on delete cascade,
  category_id        uuid not null references categories (id) on delete cascade,
  primary key (collection_item_id, category_id)
);

alter table collection_item_categories enable row level security;

create policy "collection_item_categories: accès via user_id"
  on collection_item_categories for all
  using (
    exists (
      select 1 from collection_items ci
      where ci.id = collection_item_id
        and ci.user_id = auth.uid()
    )
  );

-- ============================================================
-- RLS sur games : lecture et insertion pour tout user authentifié
-- ============================================================
alter table games enable row level security;

create policy "games: lecture pour users authentifiés"
  on games for select
  using (auth.role() = 'authenticated');

create policy "games: insertion pour users authentifiés"
  on games for insert
  with check (auth.role() = 'authenticated');
