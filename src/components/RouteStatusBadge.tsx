import { cn } from '#/lib/utils'
import type { RouteStatus, RouteStopStatus } from '#/domain/route'

const ROUTE_LABELS: Record<RouteStatus, string> = {
  PLANNED: 'Planeada',
  ACTIVE: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
}

const STOP_LABELS: Record<RouteStopStatus, string> = {
  PENDING: 'Pendiente',
  DELIVERED: 'Entregado',
  FAILED: 'Fallido',
  RETURNED: 'Devuelto',
}

const TONES: Record<string, string> = {
  PLANNED: 'bg-secondary text-secondary-foreground',
  ACTIVE: 'bg-primary/15 text-primary',
  COMPLETED: 'bg-success/15 text-success',
  CANCELLED: 'bg-destructive/15 text-destructive',
  PENDING: 'bg-secondary text-secondary-foreground',
  DELIVERED: 'bg-success/15 text-success',
  FAILED: 'bg-destructive/15 text-destructive',
  RETURNED: 'bg-muted text-muted-foreground',
}

export default function RouteStatusBadge({ status }: { status: RouteStatus }) {
  return <Badge label={ROUTE_LABELS[status]} tone={TONES[status]} />
}

export function StopStatusBadge({ status }: { status: RouteStopStatus }) {
  return <Badge label={STOP_LABELS[status]} tone={TONES[status]} />
}

function Badge({ label, tone }: { label: string; tone?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone,
      )}
    >
      {label}
    </span>
  )
}
