import { apiFetch, tokenStorage } from '#/lib/http'
import {
  currentUserSchema,
  loginResponseSchema,
} from '#/domain/auth'
import type {
  CurrentUserPrimitives,
  LoginRequestPrimitives,
  LoginResponsePrimitives,
} from '#/domain/auth'

export const authRepository = {
  async login(
    credentials: LoginRequestPrimitives,
  ): Promise<LoginResponsePrimitives> {
    const data = await apiFetch<unknown>('/login', {
      method: 'POST',
      body: credentials,
      anonymous: true,
    })

    const parsed = loginResponseSchema.parse(data)
    tokenStorage.set(parsed.token)
    return parsed
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/logout', { method: 'POST' })
    } finally {
      tokenStorage.clear()
    }
  },

  async getCurrentUser(): Promise<CurrentUserPrimitives> {
    const data = await apiFetch<unknown>('/user/current')
    return currentUserSchema.parse(data)
  },
}
