import { z } from 'zod'

export const loginRequestSchema = z.object({
  email: z.email('Correo inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

export const loginResponseSchema = z.object({
  token: z.string(),
})

export const currentUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string().optional().default(''),
  type: z.enum(['EMPLOYEE', 'CUSTOMER', 'DRIVER']).optional(),
})

export type LoginRequestPrimitives = z.infer<typeof loginRequestSchema>
export type LoginResponsePrimitives = z.infer<typeof loginResponseSchema>
export type CurrentUserPrimitives = z.infer<typeof currentUserSchema>
