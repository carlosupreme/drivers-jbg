import { ApiError, apiFetch } from '#/lib/http'
import { routeSchema } from '#/domain/route'
import type { DeliveryOutcome, RoutePrimitives } from '#/domain/route'

export interface RecordAttemptInput {
  routeId: string
  stopId: string
  outcome: DeliveryOutcome
  /** Data URL (`data:image/...;base64,...`) — the backend decodes and stores it. */
  photo: string
  /** Customer's signature (data URL) — required when outcome is DELIVERED. */
  signature?: string
  gpsLat: number
  gpsLng: number
  reason?: string
}

export const routeRepository = {
  /** Active (PLANNED or ACTIVE) route assigned to the logged-in driver. */
  async getActiveRoute(): Promise<RoutePrimitives | null> {
    try {
      const data = await apiFetch<unknown>('/driver/me/route/active')
      if (data == null) return null
      return routeSchema.parse(data)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },

  async startRoute(routeId: string): Promise<void> {
    await apiFetch(`/route/${routeId}/start`, { method: 'POST' })
  },

  async completeRoute(routeId: string): Promise<void> {
    await apiFetch(`/route/${routeId}/complete`, { method: 'POST' })
  },

  async recordAttempt(input: RecordAttemptInput): Promise<void> {
    const { routeId, stopId, ...attempt } = input

    await apiFetch(`/route/${routeId}/stop/${stopId}/attempt`, {
      method: 'POST',
      body: {
        ...attempt,
        clientTimestamp: new Date().toISOString(),
      },
    })
  },

  // TODO(backend): no driver-scoped history endpoint exists yet.
  // `POST /route/find` requires CAN_LIST_SHIPMENTS (admin only), so the
  // backend needs something like `GET /driver/me/routes/history` before
  // this can be implemented. See src/routes/_authed/history.tsx.
}
