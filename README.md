# JBG Drivers

Aplicación cliente para conductores de JBG Logística. Los conductores inician
sesión, ven su ruta asignada, registran intentos de entrega (foto + GPS) y
completan rutas.

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19, SSR, file-based routing)
- TanStack Query para estado del servidor
- Tailwind CSS v4 + componentes estilo shadcn (`src/components/ui`)
- Zod para validación de esquemas

## Desarrollo

```bash
pnpm install
pnpm dev        # http://localhost:3001 (el backend usa el 3000)
```

Configura `VITE_API_URL` en `.env.local` (por defecto `http://localhost:3000/api`).

## API del backend (usuarios tipo DRIVER)

| Endpoint | Descripción |
| --- | --- |
| `POST /login` | Inicio de sesión (devuelve JWT) |
| `GET /driver/me/route/active` | Ruta activa/asignada del conductor |
| `POST /route/:routeId/start` | Iniciar ruta |
| `POST /route/:routeId/stop/:stopId/attempt` | Registrar intento (JSON: outcome, photo como data URL base64, gpsLat, gpsLng, clientTimestamp, reason?) |
| `POST /route/:routeId/complete` | Finalizar ruta |

**Pendiente backend:** endpoint de historial de rutas del conductor
(`GET /driver/me/routes/history` o similar) — la página `/history` está en
espera de esto.

## Estructura

```
src/
  domain/      # Esquemas zod (route, auth)
  services/    # Repositorios HTTP (authRepository, routeRepository)
  hooks/       # Hooks de React Query (useAuth, useActiveRoute)
  components/  # UI (AppHeader, StopCard, badges, ui/)
  routes/      # File-based routing
    login.tsx          # Pública
    _authed.tsx        # Layout con guard de sesión
    _authed/index.tsx  # Ruta activa del día
    _authed/history.tsx # Historial (pendiente de backend)
  lib/http.ts  # Cliente fetch + tokenStorage (localStorage)
```
