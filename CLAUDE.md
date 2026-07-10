# JBG Drivers — app cliente para conductores

TanStack Start (React 19, SSR, file-based routing) + TanStack Query + Tailwind v4 + zod.
Gestor de paquetes: **pnpm**. Dev en puerto **3001** (el backend ocupa el 3000).

## Convenciones

- Alias de imports: `#/*` → `src/*` (también `@/*` en tsconfig, usar `#/`).
- Capas: `domain/` (esquemas zod) → `services/` (repositorios HTTP) → `hooks/` (React Query) → `routes/` + `components/` (UI).
- Cliente HTTP: `src/lib/http.ts` — `apiFetch()` agrega `Authorization: Bearer` desde `tokenStorage` (localStorage, clave `drivers.token`). 401 limpia el token.
- UI en español, mobile-first (los conductores usan teléfono).
- Componentes shadcn-style en `src/components/ui/` (estilo new-york, ver `components.json`).

## Auth

- `POST /login` → `{ token }` (JWT). El backend identifica al conductor por el token; nunca enviar userId/driverId desde el cliente.
- Guard de sesión en `src/routes/_authed.tsx` (`beforeLoad`, solo client-side porque el token vive en localStorage).
- Solo usuarios con `type: DRIVER` pasan las policies del backend (`isUserType("DRIVER")`).

## Endpoints del conductor (back-jbg-logistica)

- `GET /driver/me/route/active` — ruta PLANNED/ACTIVE asignada (responde `200` con `null` si no hay ruta)
- `POST /route/:routeId/start` — sin body, responde 204
- `POST /route/:routeId/stop/:stopId/attempt` — **multipart/form-data** (no JSON — evita bloquear el event loop parseando fotos grandes como base64): `outcome` (DELIVERED|FAILED), `photo` (archivo, se comprime a JPEG ≤1600px en el cliente antes de subir), `signature?` (archivo PNG, requerido si DELIVERED), `gpsLat`, `gpsLng`, `clientTimestamp` (ISO, máx. 24h de antigüedad), `reason?` — máx. 3 intentos por parada, límite de archivo 20MB
- `POST /route/:routeId/complete` — sin body, responde 204

## Pendiente

- **Historial de rutas**: no existe endpoint driver-scoped en el backend.
  `POST /route/find` exige `CAN_LIST_SHIPMENTS` (admin). Ver TODO en
  `src/routes/_authed/history.tsx` y `src/services/routeRepository.ts`.
