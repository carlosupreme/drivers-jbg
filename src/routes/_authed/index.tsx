import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Loader2, MapPinned, Navigation, PackageCheck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import StopCard from '#/components/StopCard'
import RouteStatusBadge from '#/components/RouteStatusBadge'
import RouteCompletedSummary from '#/components/RouteCompletedSummary'
import { useActiveRoute, useRouteActions } from '#/hooks/useActiveRoute'
import { ROUTE_TYPE_COPY, isStopUnresolved } from '#/domain/route'
import { ApiError } from '#/lib/http'
import type { RoutePrimitives } from '#/domain/route'

export const Route = createFileRoute('/_authed/')({
  component: ActiveRoutePage,
})

function getErrorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : 'La operación falló. Intenta de nuevo.'
}

function buildGoogleMapsUrl(route: RoutePrimitives): string | null {
  const pendingStops = route.stops
    .filter((stop) => isStopUnresolved(stop.status))
    .sort((a, b) => a.stopOrder - b.stopOrder)

  const coords = pendingStops
    .map((stop) => stop.address.geolocation)
    .filter(
      (geo): geo is NonNullable<typeof geo> =>
        geo != null && geo.latitude != null && geo.longitude != null,
    )

  if (coords.length === 0) return null

  const destination = coords[coords.length - 1]
  const waypoints = coords
    .slice(0, -1)
    .map((geo) => `${geo.latitude},${geo.longitude}`)
    .join('|')

  // Build manually: URLSearchParams would double-encode the "|" separators.
  let url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`
  if (route.origin.latitude != null && route.origin.longitude != null) {
    url += `&origin=${route.origin.latitude},${route.origin.longitude}`
  }
  if (waypoints) url += `&waypoints=${waypoints}`
  return url
}

function ActiveRoutePage() {
  const { data: route, isLoading, isError } = useActiveRoute()
  const { startRoute, completeRoute } = useRouteActions()
  // Snapshot of the route at the moment it was completed: the backend stops
  // returning it as "active", so this is what feeds the success screen.
  const [completedRoute, setCompletedRoute] = useState<RoutePrimitives | null>(
    null,
  )

  if (completedRoute) {
    return (
      <RouteCompletedSummary
        route={completedRoute}
        onDismiss={() => setCompletedRoute(null)}
      />
    )
  }

  if (isLoading) {
    return (
      <div className="text-muted-foreground flex items-center justify-center gap-2 py-16">
        <Loader2 className="size-5 animate-spin" />
        Cargando tu ruta…
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-destructive py-16 text-center">
        No se pudo cargar la ruta. Intenta de nuevo.
      </p>
    )
  }

  if (!route) {
    return (
      <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
        <MapPinned className="size-10" />
        <p className="text-foreground font-medium">Sin ruta asignada</p>
        <p className="text-sm">
          Cuando te asignen una ruta aparecerá aquí automáticamente.
        </p>
      </div>
    )
  }

  const sortedStops = [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder)
  const pendingCount = sortedStops.filter(
    (stop) => stop.status === 'PENDING',
  ).length
  const unresolvedCount = sortedStops.filter((stop) =>
    isStopUnresolved(stop.status),
  ).length
  const deliveredCount = sortedStops.filter(
    (stop) => stop.status === 'DELIVERED',
  ).length
  const mapsUrl = buildGoogleMapsUrl(route)
  const copy = ROUTE_TYPE_COPY[route.type]

  const showStickyAction =
    route.status === 'PLANNED' ||
    (route.status === 'ACTIVE' && unresolvedCount === 0)

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-lg">{copy.title}</CardTitle>
          <RouteStatusBadge status={route.status} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-sm">
            {deliveredCount} de {sortedStops.length} paradas {copy.stopsDone} ·{' '}
            {pendingCount} pendientes
          </p>

          {route.status === 'ACTIVE' && mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="border-border text-foreground flex h-11 items-center justify-center gap-2 rounded-md border text-sm font-semibold"
            >
              <Navigation className="size-4" />
              Navegar con Google Maps
            </a>
          )}

          {(startRoute.isError || completeRoute.isError) && (
            <p className="text-destructive text-sm" role="alert">
              {getErrorMessage(startRoute.error ?? completeRoute.error)}
            </p>
          )}
        </CardContent>
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          Paradas
        </h2>
        {sortedStops.map((stop) => (
          <StopCard
            key={stop.id}
            stop={stop}
            routeId={route.id}
            routeStatus={route.status}
            routeType={route.type}
          />
        ))}
      </section>

      {showStickyAction && (
        <>
          {/* Spacer so the last stop card isn't hidden behind the floating button */}
          <div aria-hidden className="h-14" />
          <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-10 mx-auto w-full max-w-md px-4">
            {route.status === 'PLANNED' ? (
              <button
                type="button"
                disabled={startRoute.isPending}
                onClick={() => startRoute.mutate(route.id)}
                className="bg-primary text-primary-foreground h-12 w-full rounded-md text-sm font-semibold shadow-lg disabled:opacity-60"
              >
                {startRoute.isPending ? 'Iniciando…' : 'Iniciar ruta'}
              </button>
            ) : (
              <button
                type="button"
                disabled={completeRoute.isPending}
                onClick={() =>
                  completeRoute.mutate(route.id, {
                    onSuccess: () => setCompletedRoute(route),
                  })
                }
                className="bg-success text-success-foreground flex h-12 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold shadow-lg disabled:opacity-60"
              >
                <PackageCheck className="size-4" />
                {completeRoute.isPending ? 'Finalizando…' : 'Finalizar ruta'}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
