import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authRepository } from '#/services/authRepository'
import { tokenStorage } from '#/lib/http'
import type { LoginRequestPrimitives } from '#/domain/auth'

const CURRENT_USER_KEY = ['auth', 'current-user'] as const

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: authRepository.getCurrentUser,
    enabled: tokenStorage.get() !== null,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (credentials: LoginRequestPrimitives) =>
      authRepository.login(credentials),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_KEY })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authRepository.logout(),
    onSettled: () => {
      queryClient.clear()
    },
  })
}
