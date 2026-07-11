import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Eye, EyeOff, Truck } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { loginRequestSchema } from '#/domain/auth'
import { useLogin } from '#/hooks/useAuth'
import { tokenStorage } from '#/lib/http'

export const Route = createFileRoute('/login')({
  beforeLoad: () => {
    if (typeof window !== 'undefined' && tokenStorage.get()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setValidationError(null)

    const parsed = loginRequestSchema.safeParse({ email, password })
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message ?? 'Datos inválidos',
      )
      return
    }

    login.mutate(parsed.data, {
      onSuccess: () => {
        void navigate({ to: '/' })
      },
    })
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="bg-primary text-primary-foreground mx-auto mb-2 flex size-12 items-center justify-center rounded-full">
            <Truck className="size-6" />
          </div>
          <CardTitle className="text-xl">JBG Drivers</CardTitle>
          <p className="text-muted-foreground text-sm">
            Inicia sesión para ver tus rutas
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Correo electrónico
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-input bg-background focus-visible:ring-ring h-10 rounded-md border px-3 text-base font-normal outline-none focus-visible:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Contraseña
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-input bg-background focus-visible:ring-ring h-10 w-full rounded-md border px-3 pr-10 text-base font-normal outline-none focus-visible:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={
                    showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                  }
                  className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </label>

            {(validationError || login.isError) && (
              <p className="text-destructive text-sm" role="alert">
                {validationError ??
                  'No se pudo iniciar sesión. Verifica tus credenciales.'}
              </p>
            )}

            <button
              type="submit"
              disabled={login.isPending}
              className="bg-primary text-primary-foreground h-10 rounded-md text-sm font-semibold disabled:opacity-60"
            >
              {login.isPending ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
