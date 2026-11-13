import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import AdminPage from './pages/AdminPage'

type Route = 'home' | 'admin'

function readRoute(pathname: string): Route {
  const normalized = pathname.replace(/\/+$/, '')
  return normalized === '/admin' ? 'admin' : 'home'
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => readRoute(window.location.pathname))

  useEffect(() => {
    const onNavigate = () => setRoute(readRoute(window.location.pathname))
    window.addEventListener('popstate', onNavigate)
    return () => window.removeEventListener('popstate', onNavigate)
  }, [])

  return route === 'admin' ? <AdminPage /> : <HomePage />
}
