import { createFileRoute } from '@tanstack/react-router'
import { History } from 'lucide-react'

export const Route = createFileRoute('/_authed/history')({
  component: HistoryPage,
})

// TODO(backend): the API does not expose a driver-scoped history endpoint
// yet. `POST /route/find` requires the CAN_LIST_SHIPMENTS permission (admin
// only), so drivers cannot call it. Once something like
// `GET /driver/me/routes/history` exists, add it to
// src/services/routeRepository.ts and render the list here.
function HistoryPage() {
  return (
    <div className="text-muted-foreground flex flex-col items-center gap-3 py-16 text-center">
      <History className="size-10" />
      <p className="text-foreground font-medium">Historial de rutas</p>
      <p className="max-w-xs text-sm">
        Próximamente: aquí verás tus rutas completadas. Falta el endpoint del
        backend para consultar el historial del conductor.
      </p>
    </div>
  )
}
