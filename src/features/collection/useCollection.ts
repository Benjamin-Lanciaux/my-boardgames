import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { fetchBggDetail } from '@/lib/bgg'
import type { CollectionItem } from '@/types'

export function useCollection(userId: string) {
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [collectionBggIds, setCollectionBggIds] = useState<Set<number>>(new Set())

  const fetchCollection = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data } = await supabase
      .from('collection_items')
      .select('*, game:games(*)')
      .eq('user_id', userId)
      .order('added_at', { ascending: false })
    if (data) {
      setItems(data)
      setCollectionBggIds(new Set(data.map((i: CollectionItem) => i.game?.bgg_id).filter(Boolean)))
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchCollection() }, [fetchCollection])

  async function addGame(bgg_id: number): Promise<{ success: boolean; message?: string }> {
    const detail = await fetchBggDetail(bgg_id)
    if (!detail) return { success: false, message: 'Impossible de récupérer les détails du jeu' }

    const { data: game, error: gameError } = await supabase
      .from('games')
      .upsert(detail, { onConflict: 'bgg_id' })
      .select()
      .single()

    if (gameError || !game) return { success: false, message: gameError?.message }

    const { error } = await supabase
      .from('collection_items')
      .insert({ user_id: userId, game_id: game.id })

    if (error) return { success: false, message: error.message }
    await fetchCollection()
    return { success: true }
  }

  async function removeGame(itemId: string) {
    await supabase.from('collection_items').delete().eq('id', itemId)
    await fetchCollection()
  }

  return { items, loading, addGame, removeGame, collectionBggIds }
}
