import { ApiError, apiFetch } from '#/lib/http'
import { routeSchema } from '#/domain/route'
import type { DeliveryOutcome, RoutePrimitives } from '#/domain/route'

export interface RecordAttemptInput {
  routeId: string
  stopId: string
  outcome: DeliveryOutcome
  /** Compressed JPEG blob — sent as multipart/form-data, not base64 JSON. */
  photo: Blob
  /** Customer's signature blob — required when outcome is DELIVERED. */
  signature?: Blob
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

  /** Sent as multipart/form-data so large photos stream straight to disk
   * instead of getting base64-encoded into one big JSON string, which used
   * to block the server while it parsed the request body. */
  async recordAttempt(input: RecordAttemptInput): Promise<void> {
    const { routeId, stopId, photo, signature, ...fields } = input

    const formData = new FormData()
    formData.append('photo', photo, 'evidence.jpg')
    if (signature) formData.append('signature', signature, 'signature.png')
    formData.append('outcome', fields.outcome)
    formData.append('gpsLat', String(fields.gpsLat))
    formData.append('gpsLng', String(fields.gpsLng))
    formData.append('clientTimestamp', new Date().toISOString())
    if (fields.reason) formData.append('reason', fields.reason)

    await apiFetch(`/route/${routeId}/stop/${stopId}/attempt`, {
      method: 'POST',
      body: formData,
    })
  },

  // TODO(backend): no driver-scoped history endpoint exists yet.
  // `POST /route/find` requires CAN_LIST_SHIPMENTS (admin only), so the
  // backend needs something like `GET /driver/me/routes/history` before
  // this can be implemented. See src/routes/_authed/history.tsx.
}
