import { z } from 'zod'

export const MAX_DELIVERY_ATTEMPTS = 3

export const geolocationSchema = z.object({
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
  placeId: z.string().nullish(),
})

export const stopAddressSchema = z.object({
  address1: z.string().optional().default(''),
  address2: z.string().optional().default(''),
  city: z.string().optional().default(''),
  province: z.string().optional().default(''),
  zip: z.string().optional().default(''),
  country: z.string().optional().default(''),
  reference: z.string().optional().default(''),
  geolocation: geolocationSchema.nullish(),
})

export const deliveryOutcomes = ['DELIVERED', 'FAILED'] as const

export const deliveryAttemptSchema = z.object({
  attemptNumber: z.number(),
  outcome: z.enum(deliveryOutcomes),
  reason: z.string().nullish(),
  photoPath: z.string().nullish(),
  gpsLocation: geolocationSchema.nullish(),
  driverId: z.string(),
  clientTimestamp: z.string(),
  serverTimestamp: z.string(),
})

export const routeStopStatuses = [
  'PENDING',
  'DELIVERED',
  'FAILED',
  'RETURNED',
] as const

export const routeStopSchema = z.object({
  id: z.string(),
  stopOrder: z.number(),
  shipmentId: z.string(),
  address: stopAddressSchema,
  status: z.enum(routeStopStatuses),
  attempts: z.array(deliveryAttemptSchema).optional().default([]),
})

export const routeStatuses = [
  'PLANNED',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
] as const

export const routeSchema = z.object({
  id: z.string(),
  origin: geolocationSchema,
  driverId: z.string(),
  stops: z.array(routeStopSchema),
  status: z.enum(routeStatuses),
  finishDate: z.string().nullish(),
})

export type GeolocationPrimitives = z.infer<typeof geolocationSchema>
export type StopAddressPrimitives = z.infer<typeof stopAddressSchema>
export type DeliveryOutcome = (typeof deliveryOutcomes)[number]
export type DeliveryAttemptPrimitives = z.infer<typeof deliveryAttemptSchema>
export type RouteStopStatus = (typeof routeStopStatuses)[number]
export type RouteStopPrimitives = z.infer<typeof routeStopSchema>
export type RouteStatus = (typeof routeStatuses)[number]
export type RoutePrimitives = z.infer<typeof routeSchema>

export function formatStopAddress(address: StopAddressPrimitives): string {
  return [address.address1, address.address2, address.city, address.province]
    .filter(Boolean)
    .join(', ')
}
