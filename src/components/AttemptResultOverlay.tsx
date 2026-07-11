import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  MAX_DELIVERY_ATTEMPTS,
  ROUTE_TYPE_COPY,
  formatStopAddress,
} from '#/domain/route'
import type {
  DeliveryOutcome,
  RouteStopPrimitives,
  RouteType,
} from '#/domain/route'

/** Snapshot of the attempt just recorded — captured before the refetch
 * updates the stop, so the overlay can describe what the driver did. */
export interface AttemptResult {
  outcome: DeliveryOutcome
  attemptNumber: number
  reason?: string
}

interface AttemptResultOverlayProps {
  result: AttemptResult
  stop: RouteStopPrimitives
  routeType: RouteType
  onDismiss: () => void
}

export default function AttemptResultOverlay({
  result,
  stop,
  routeType,
  onDismiss,
}: AttemptResultOverlayProps) {
  const copy = ROUTE_TYPE_COPY[routeType]
  const delivered = result.outcome === 'DELIVERED'
  const attemptsLeft = MAX_DELIVERY_ATTEMPTS - result.attemptNumber

  return (
    <div className="bg-background/95 fixed inset-0 z-30 flex items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-3 text-center">
        {delivered ? (
          <CheckCircle2 className="text-success size-16" />
        ) : (
          <AlertTriangle className="text-destructive size-16" />
        )}

        <h2 className="text-xl font-bold">
          {delivered ? copy.successLabel : 'Intento fallido registrado'}
        </h2>

        <p className="text-muted-foreground text-sm">
          Parada {stop.stopOrder} ·{' '}
          {formatStopAddress(stop.address) || 'Dirección no disponible'}
        </p>

        {delivered ? (
          <p className="text-muted-foreground text-sm">
            Evidencia y firma guardadas.
          </p>
        ) : (
          <>
            {result.reason && (
              <p className="text-sm">
                <span className="font-medium">Motivo:</span> {result.reason}
              </p>
            )}
            <p className="text-muted-foreground text-sm">
              {attemptsLeft > 0
                ? `Intento ${result.attemptNumber} de ${MAX_DELIVERY_ATTEMPTS} · ${
                    attemptsLeft === 1
                      ? 'queda 1 intento'
                      : `quedan ${attemptsLeft} intentos`
                  }`
                : 'Se agotaron los intentos: el paquete se marcará como devuelto.'}
            </p>
          </>
        )}

        <button
          type="button"
          onClick={onDismiss}
          className="bg-primary text-primary-foreground mt-2 h-11 w-full rounded-md text-sm font-semibold"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
