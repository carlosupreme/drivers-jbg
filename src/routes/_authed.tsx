import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import AppHeader from '#/components/AppHeader'
import { tokenStorage } from '#/lib/http'

export const Route = createFileRoute('/_authed')({
  beforeLoad: () => {
    // Token lives in localStorage, so the guard only runs client-side.
    if (typeof window !== 'undefined' && !tokenStorage.get()) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthedLayout,
})

function AuthedLayout() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
      <AppHeader />
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
