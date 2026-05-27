import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LandingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          My Boardgames
        </h1>
        <Button asChild className="mt-6">
          <Link to="/login">Go to login</Link>
        </Button>
      </div>
    </main>
  )
}
