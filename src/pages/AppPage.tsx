import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/features/auth/useAuth'
import { useCollection } from '@/features/collection/useCollection'
import { searchBgg } from '@/lib/bgg'
import type { BggSearchResult } from '@/lib/bgg'
import { toast } from 'sonner'

export function AppPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const { items, loading: collectionLoading, addGame, removeGame, collectionBggIds } = useCollection(user?.id ?? '')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<BggSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [addingId, setAddingId] = useState<number | null>(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [authLoading, user, navigate])

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>
  }
  if (!user) return null

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setResults([])
    try {
      const res = await searchBgg(query)
      setResults(res)
      if (res.length === 0) toast.info('Aucun résultat pour cette recherche')
    } catch {
      toast.error('Erreur lors de la recherche BGG')
    } finally {
      setSearching(false)
    }
  }

  async function handleAdd(bgg_id: number) {
    setAddingId(bgg_id)
    const { success, message } = await addGame(bgg_id)
    if (success) {
      toast.success('Jeu ajouté à votre collection !')
    } else {
      toast.error(message ?? 'Erreur lors de l\'ajout')
    }
    setAddingId(null)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">My Boardgames</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">{user.email}</span>
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            Déconnexion
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* Recherche BGG */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Ajouter un jeu depuis BGG</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Rechercher un jeu (ex: Catan, Pandemic...)"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={searching}>
              {searching ? 'Recherche...' : 'Rechercher'}
            </Button>
          </form>

          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map(game => (
                <Card key={game.bgg_id}>
                  <CardContent className="flex items-center justify-between py-3 px-4">
                    <div>
                      <p className="font-medium">{game.name}</p>
                      {game.year && <p className="text-sm text-gray-500">{game.year}</p>}
                    </div>
                    {collectionBggIds.has(game.bgg_id) ? (
                      <span className="text-sm text-green-600 font-medium">Dans la collection ✓</span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAdd(game.bgg_id)}
                        disabled={addingId === game.bgg_id}
                      >
                        {addingId === game.bgg_id ? 'Ajout...' : '+ Ajouter'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Collection */}
        <section>
          <h2 className="text-lg font-semibold mb-3">
            Ma collection{!collectionLoading && ` (${items.length})`}
          </h2>
          {collectionLoading ? (
            <p className="text-gray-500">Chargement...</p>
          ) : items.length === 0 ? (
            <p className="text-gray-500">
              Votre collection est vide. Recherchez des jeux ci-dessus pour commencer.
            </p>
          ) : (
            <div className="space-y-2">
              {items.map(item => (
                <Card key={item.id}>
                  <CardContent className="flex items-center gap-4 py-3 px-4">
                    {item.game?.thumbnail_url && (
                      <img
                        src={item.game.thumbnail_url}
                        alt={item.game.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.game?.name}</p>
                      <div className="text-sm text-gray-500 flex gap-3 flex-wrap">
                        {item.game?.year && <span>{item.game.year}</span>}
                        {item.game?.min_players != null && item.game?.max_players != null && (
                          <span>{item.game.min_players}–{item.game.max_players} joueurs</span>
                        )}
                        {item.game?.playing_time && <span>~{item.game.playing_time} min</span>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-600 flex-shrink-0"
                      onClick={() => removeGame(item.id)}
                    >
                      Retirer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
