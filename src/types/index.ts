export interface Game {
  id: string
  bgg_id: number
  name: string
  year: number | null
  image_url: string | null
  thumbnail_url: string | null
  min_players: number | null
  max_players: number | null
  playing_time: number | null
  created_at: string
}

export interface CollectionItem {
  id: string
  user_id: string
  game_id: string
  rating: number | null
  last_played_at: string | null
  notes: string | null
  added_at: string
  game?: Game
}
