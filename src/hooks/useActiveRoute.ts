import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { routeRepository } from '#/services/routeRepository'
import type { RecordAttemptInput } from '#/services/routeRepository'

const ACTIVE_ROUTE_KEY = ['driver', 'active-route'] as const

export function useActiveRoute() {
  return useQuery({
    queryKey: ACTIVE_ROUTE_KEY,
    queryFn: routeRepository.getActiveRoute,
    refetchInterval: 60 * 1000,
  })
}

export function useRouteActions() {
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ACTIVE_ROUTE_KEY })

  const startRoute = useMutation({
    mutationFn: (routeId: string) => routeRepository.startRoute(routeId),
    onSuccess: invalidate,
  })

  const completeRoute = useMutation({
    mutationFn: (routeId: string) => routeRepository.completeRoute(routeId),
    onSuccess: invalidate,
  })

  const recordAttempt = useMutation({
    mutationFn: (input: RecordAttemptInput) =>
      routeRepository.recordAttempt(input),
    onSuccess: invalidate,
  })

  return { startRoute, completeRoute, recordAttempt }
}
