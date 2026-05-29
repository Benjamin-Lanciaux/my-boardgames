import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'
import { toast } from 'sonner'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const error = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password)
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else if (mode === 'signup') {
      toast.success('Compte créé ! Vérifiez votre email pour confirmer.')
    } else {
      navigate('/app')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 p-8 bg-white rounded-xl shadow">
        <div>
          <h1 className="text-2xl font-bold">My Boardgames</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'login' ? 'Connectez-vous à votre collection' : 'Créez votre compte'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
          </Button>
        </form>
        <p className="text-sm text-center text-gray-500">
          {mode === 'login' ? "Pas encore de compte ?" : 'Déjà un compte ?'}{' '}
          <button
            type="button"
            className="text-blue-600 hover:underline"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  )
}
