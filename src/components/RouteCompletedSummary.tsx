import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { StopStatusBadge } from '#/components/RouteStatusBadge'
import { ROUTE_TYPE_COPY, formatStopAddress } from '#/domain/route'
import type { RoutePrimitives } from '#/domain/route'

interface RouteCompletedSummaryProps {
  /** Snapshot of the route taken right before it was completed — the backend
   * stops returning it as "active" afterwards, so this is the only source. */
  route: RoutePrimitives
  onDismiss: () => void
}

export default function RouteCompletedSummary({
  route,
  onDismiss,
}: RouteCompletedSummaryProps) {
  // The snapshot predates the completion, so it carries no finishDate —
  // the moment this screen mounts is the completion time.
  const [completedAt] = useState(() => new Date())
  const copy = ROUTE_TYPE_COPY[route.type]

  const sortedStops = [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder)
  const deliveredCount = sortedStops.filter(
    (stop) => stop.status === 'DELIVERED',
  ).length
  const returnedCount = sortedStops.filter(
    (stop) => stop.status === 'RETURNED',
  ).length
  const failedAttempts = sortedStops.reduce(
    (total, stop) =>
      total + stop.attempts.filter((a) => a.outcome === 'FAILED').length,
    0,
  )

  const doneLabel =
    copy.stopsDone.charAt(0).toUpperCase() + copy.stopsDone.slice(1)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 pt-6 text-center">
        <CheckCircle2 className="text-success size-14" />
        <h1 className="text-xl font-bold">¡Ruta completada!</h1>
        <p className="text-muted-foreground text-sm">
          {copy.title} · finalizada a las{' '}
          {completedAt.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      <Card className="py-4">
        <CardContent className="grid grid-cols-3 gap-2 px-4 text-center">
          <SummaryStat
            value={deliveredCount}
            label={doneLabel}
            tone="text-success"
          />
          <SummaryStat value={returnedCount} label="Devueltas" />
          <SummaryStat value={failedAttempts} label="Intentos fallidos" />
        </CardContent>
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          Paradas ({sortedStops.length})
        </h2>
        {sortedStops.map((stop) => (
          <Card key={stop.id} className="py-3">
            <CardContent className="flex items-center gap-2 px-4">
              <span className="bg-secondary text-secondary-foreground flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                {stop.stopOrder}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm">
                {formatStopAddress(stop.address) || 'Dirección no disponible'}
              </p>
              <StopStatusBadge status={stop.status} />
            </CardContent>
          </Card>
        ))}
      </section>

      <button
        type="button"
        onClick={onDismiss}
        className="bg-primary text-primary-foreground h-11 w-full rounded-md text-sm font-semibold"
      >
        Continuar
      </button>
    </div>
  )
}

function SummaryStat({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone?: string
}) {
  return (
    <div className="flex flex-col">
      <span className={`text-2xl font-bold ${tone ?? ''}`}>{value}</span>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  )
}
