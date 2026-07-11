import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { LogOut, UserRound } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import ThemeToggle from '#/components/ThemeToggle'
import { useCurrentUser, useLogout } from '#/hooks/useAuth'

export const Route = createFileRoute('/_authed/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  const { data: user } = useCurrentUser()
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
    <div className="flex flex-col gap-4">
      <Card className="py-4">
        <CardContent className="flex items-center gap-3 px-4">
          <span className="bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full">
            <UserRound className="size-6" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">
              {user?.name || 'Conductor'}
            </p>
            <p className="text-muted-foreground truncate text-sm">
              {user?.email}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="py-4">
        <CardContent className="flex items-center justify-between gap-3 px-4">
          <div>
            <p className="text-sm font-medium">Tema</p>
            <p className="text-muted-foreground text-xs">
              Claro, oscuro o automático
            </p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="border-destructive/40 text-destructive flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold disabled:opacity-60"
      >
        <LogOut className="size-4" />
        {logout.isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </div>
  )
}
