import { useState } from 'react'
import { Camera, MapPin } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { StopStatusBadge } from '#/components/RouteStatusBadge'
import { SignaturePad } from '#/components/SignaturePad'
import { useRouteActions } from '#/hooks/useActiveRoute'
import { ApiError } from '#/lib/http'
import {
  MAX_DELIVERY_ATTEMPTS,
  ROUTE_TYPE_COPY,
  formatStopAddress,
} from '#/domain/route'
import type {
  DeliveryOutcome,
  RoutePrimitives,
  RouteStopPrimitives,
  RouteType,
} from '#/domain/route'

interface StopCardProps {
  stop: RouteStopPrimitives
  routeId: string
  routeStatus: RoutePrimitives['status']
  routeType: RouteType
}

/** The backend expects the photo as a data URL string, not multipart. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('No se pudo leer la foto'))
    reader.readAsDataURL(file)
  })
}

export default function StopCard({
  stop,
  routeId,
  routeStatus,
  routeType,
}: StopCardProps) {
  const copy = ROUTE_TYPE_COPY[routeType]
  const { recordAttempt } = useRouteActions()
  const [formOpen, setFormOpen] = useState(false)
  const [outcome, setOutcome] = useState<DeliveryOutcome>('DELIVERED')
  const [reason, setReason] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const attemptsUsed = stop.attempts.length
  // Terminal statuses (mirrors backend RouteStop.isTerminal) are DELIVERED and
  // RETURNED — FAILED still has attempts left and must remain retriable.
  const isTerminal = stop.status === 'DELIVERED' || stop.status === 'RETURNED'
  const canAttempt =
    routeStatus === 'ACTIVE' &&
    !isTerminal &&
    attemptsUsed < MAX_DELIVERY_ATTEMPTS

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    if (!photo) {
      setFormError('La foto de evidencia es obligatoria.')
      return
    }
    if (outcome === 'FAILED' && !reason.trim()) {
      setFormError('Indica el motivo del intento fallido.')
      return
    }
    if (outcome === 'DELIVERED' && !signature) {
      setFormError('La firma es obligatoria.')
      return
    }

    let photoDataUrl: string
    try {
      photoDataUrl = await fileToDataUrl(photo)
    } catch {
      setFormError('No se pudo procesar la foto. Intenta tomarla de nuevo.')
      return
    }

    recordAttempt.mutate(
      {
        routeId,
        stopId: stop.id,
        outcome,
        photo: photoDataUrl,
        signature: outcome === 'DELIVERED' ? (signature ?? undefined) : undefined,
        // TODO: reponer la verificación de ubicación GPS del driver. Se quitó
        // temporalmente para pruebas; hay que volver a pedir navigator.geolocation
        // (getCurrentPosition) y enviar las coords reales en vez de 0/0.
        gpsLat: 0,
        gpsLng: 0,
        reason: outcome === 'FAILED' ? reason.trim() : undefined,
      },
      {
        onSuccess: () => {
          setFormOpen(false)
          setPhoto(null)
          setReason('')
          setSignature(null)
        },
        onError: (error) => {
          console.error('[StopCard] recordAttempt failed', {
            routeId,
            stopId: stop.id,
            outcome,
            error,
          })
          setFormError(
            error instanceof ApiError
              ? error.message
              : 'No se pudo registrar el intento. Intenta de nuevo.',
          )
        },
      },
    )
  }

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <span className="bg-secondary text-secondary-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold">
              {stop.stopOrder}
            </span>
            <div>
              <p className="text-muted-foreground text-xs">{copy.addressHint}:</p>
              <p className="text-sm font-medium leading-snug">
                {formatStopAddress(stop.address) || 'Dirección no disponible'}
              </p>
              {stop.address.reference && (
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <MapPin className="size-3" />
                  {stop.address.reference}
                </p>
              )}
            </div>
          </div>
          <StopStatusBadge status={stop.status} />
        </div>

        {attemptsUsed > 0 && (
          <p className="text-muted-foreground text-xs">
            Intentos: {attemptsUsed} de {MAX_DELIVERY_ATTEMPTS}
          </p>
        )}

        {canAttempt && !formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="bg-primary text-primary-foreground h-10 rounded-md text-sm font-semibold"
          >
            {copy.stopAction}
          </button>
        )}

        {canAttempt && formOpen && (
          <form
            onSubmit={handleSubmit}
            className="border-border flex flex-col gap-3 rounded-md border p-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <OutcomeOption
                label={copy.successLabel}
                selected={outcome === 'DELIVERED'}
                onSelect={() => setOutcome('DELIVERED')}
              />
              <OutcomeOption
                label="Fallido"
                selected={outcome === 'FAILED'}
                destructive
                onSelect={() => {
                  setOutcome('FAILED')
                  setSignature(null)
                }}
              />
            </div>

            {outcome === 'FAILED' && (
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Motivo
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Cliente ausente, dirección incorrecta…"
                  className="border-input bg-background h-10 rounded-md border px-3 text-base font-normal"
                />
              </label>
            )}

            {outcome === 'DELIVERED' && (
              <div className="flex flex-col gap-1.5 text-sm font-medium">
                {copy.signatureLabel}
                <SignaturePad
                  hasValue={!!signature}
                  onChange={setSignature}
                  prompt={copy.signaturePrompt}
                />
              </div>
            )}

            <label className="border-input text-muted-foreground flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed text-sm">
              <Camera className="size-4" />
              {photo ? photo.name : 'Tomar foto de evidencia'}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              />
            </label>

            {formError && (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="border-border h-10 rounded-md border text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={recordAttempt.isPending}
                className="bg-primary text-primary-foreground h-10 rounded-md text-sm font-semibold disabled:opacity-60"
              >
                {recordAttempt.isPending ? 'Enviando…' : 'Confirmar'}
              </button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

function OutcomeOption({
  label,
  selected,
  destructive = false,
  onSelect,
}: {
  label: string
  selected: boolean
  destructive?: boolean
  onSelect: () => void
}) {
  const selectedTone = destructive
    ? 'bg-destructive text-destructive-foreground border-destructive'
    : 'bg-success text-success-foreground border-success'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`h-10 rounded-md border text-sm font-semibold ${
        selected ? selectedTone : 'border-border text-muted-foreground'
      }`}
    >
      {label}
    </button>
  )
}
