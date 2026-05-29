# Data model

## users
Géré par Supabase Auth (table auth.users).

## games (cache des jeux BGG, partagé entre tous les users)
- id (uuid, pk)
- bgg_id (int, unique)
- name (text)
- year (int, nullable)
- image_url (text, nullable)
- thumbnail_url (text, nullable)
- min_players (int, nullable)
- max_players (int, nullable)
- playing_time (int, nullable)  -- minutes
- created_at (timestamptz, default now())

## collection_items
- id (uuid, pk)
- user_id (uuid, fk auth.users) -- RLS: user ne voit que ses items
- game_id (uuid, fk games)
- rating (int, 1-10, nullable)
- last_played_at (date, nullable)
- notes (text, nullable)
- added_at (timestamptz, default now())
- unique (user_id, game_id)

## categories
- id (uuid, pk)
- user_id (uuid, fk auth.users)
- name (text)
- color (text, nullable)

## collection_item_categories (many-to-many)
- collection_item_id (uuid, fk)
- category_id (uuid, fk)
- pk composite (collection_item_id, category_id)

## Row Level Security
- games : lecture libre pour tous les users authentifiés, insertion possible par tout user authentifié
- collection_items : un user ne voit/modifie que ses propres lignes (user_id = auth.uid())
- categories : idem, isolation par user_id
- collection_item_categories : accès lié au user_id du collection_item parent
