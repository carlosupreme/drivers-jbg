import { Link } from '@tanstack/react-router'
import { History, Truck, UserRound } from 'lucide-react'
import { useActiveRoute } from '#/hooks/useActiveRoute'
import { isStopUnresolved } from '#/domain/route'
import type { ComponentProps, ReactNode } from 'react'

export default function BottomNav() {
  const { data: route } = useActiveRoute()
  const unresolvedCount =
    route?.stops.filter((stop) => isStopUnresolved(stop.status)).length ?? 0

  return (
    <nav className="border-border bg-card fixed inset-x-0 bottom-0 z-20 border-t pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid h-16 w-full max-w-md grid-cols-3">
        <NavTab
          to="/"
          label="Mi ruta"
          icon={<Truck className="size-5" />}
          badge={unresolvedCount}
        />
        <NavTab
          to="/history"
          label="Historial"
          icon={<History className="size-5" />}
        />
        <NavTab
          to="/profile"
          label="Perfil"
          icon={<UserRound className="size-5" />}
        />
      </div>
    </nav>
  )
}

function NavTab({
  to,
  label,
  icon,
  badge = 0,
}: {
  to: ComponentProps<typeof Link>['to']
  label: string
  icon: ReactNode
  badge?: number
}) {
  return (
    <Link
      to={to}
      className="text-muted-foreground [&.active]:text-primary flex flex-col items-center justify-center gap-1 text-xs font-medium"
    >
      <span className="relative">
        {icon}
        {badge > 0 && (
          <span className="bg-primary text-primary-foreground absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold">
            {badge}
          </span>
        )}
      </span>
      {label}
    </Link>
  )
}
