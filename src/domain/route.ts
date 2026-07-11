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
  signaturePath: z.string().nullish(),
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

/**
 * DELIVERY — entregar paquetes al destinatario.
 * PICKING  — recolectar paquetes en el domicilio del remitente.
 * BOX_DROP — dejar cajas vacías en el domicilio del remitente.
 */
export const routeTypes = ['DELIVERY', 'PICKING', 'BOX_DROP'] as const

export const routeSchema = z.object({
  id: z.string(),
  // Rutas creadas antes del feature de tipos no traen el campo
  type: z.enum(routeTypes).optional().default('DELIVERY'),
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
export type RouteType = (typeof routeTypes)[number]
export type RoutePrimitives = z.infer<typeof routeSchema>

/** Textos por tipo de ruta: qué hace el conductor en cada parada. */
export const ROUTE_TYPE_COPY: Record<
  RouteType,
  {
    title: string
    stopsDone: string
    stopAction: string
    successLabel: string
    addressHint: string
    /** Label shown above the signature pad on a successful attempt. */
    signatureLabel: string
    /** Placeholder inside the empty signature pad. */
    signaturePrompt: string
  }
> = {
  DELIVERY: {
    title: 'Ruta de entregas',
    stopsDone: 'entregadas',
    stopAction: 'Registrar entrega',
    successLabel: 'Entregado',
    addressHint: 'Entregar en',
    signatureLabel: 'Firma de quien recibe',
    signaturePrompt: 'Pide al destinatario que firme aquí',
  },
  PICKING: {
    title: 'Ruta de recolección',
    stopsDone: 'recolectadas',
    stopAction: 'Registrar recolección',
    successLabel: 'Recolectado',
    addressHint: 'Recolectar en',
    signatureLabel: 'Firma de quien entrega el paquete',
    signaturePrompt: 'Pide al remitente que firme aquí',
  },
  BOX_DROP: {
    title: 'Ruta de cajas vacías',
    stopsDone: 'entregadas',
    stopAction: 'Registrar entrega de caja',
    successLabel: 'Caja entregada',
    addressHint: 'Dejar caja en',
    signatureLabel: 'Firma de quien recibe la caja',
    signaturePrompt: 'Pide al remitente que firme aquí',
  },
}

/** Mirrors backend RouteStop.isTerminal: only DELIVERED/RETURNED are done —
 * FAILED still needs a retry, so it must still count as unresolved. */
export function isStopUnresolved(status: RouteStopStatus): boolean {
  return status === 'PENDING' || status === 'FAILED'
}

export function formatStopAddress(address: StopAddressPrimitives): string {
  return [address.address1, address.address2, address.city, address.province]
    .filter(Boolean)
    .join(', ')
}
