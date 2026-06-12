import { Link, useNavigate } from '@tanstack/react-router'
import { History, LogOut, Truck } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useLogout } from '#/hooks/useAuth'

export default function AppHeader() {
  const navigate = useNavigate()
  const logout = useLogout()

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        void navigate({ to: '/login' })
      },
    })
  }

  return (
    <header className="border-border bg-card sticky top-0 z-10 flex items-center gap-2 border-b px-4 py-3">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <Truck className="text-primary size-5" />
        <span>JBG Drivers</span>
      </Link>

      <nav className="ml-auto flex items-center gap-1">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium [&.active]:text-foreground"
        >
          Mi ruta
        </Link>
        <Link
          to="/history"
          className="text-muted-foreground hover:text-foreground flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium [&.active]:text-foreground"
        >
          <History className="size-4" />
          Historial
        </Link>
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
          className="text-muted-foreground hover:text-destructive rounded-md p-2"
        >
          <LogOut className="size-4" />
        </button>
      </nav>
    </header>
  )
}
