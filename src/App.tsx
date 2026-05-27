import { Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { AppPage } from '@/pages/AppPage'
import { LandingPage } from '@/pages/LandingPage'
import { LoginPage } from '@/pages/LoginPage'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/app" element={<AppPage />} />
      </Routes>
      <Toaster />
    </>
  )
}

export default App
