import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import AppHeader from '#/components/AppHeader'
import BottomNav from '#/components/BottomNav'
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
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <AppHeader />
      {/* pb clears the fixed bottom nav (h-16) plus breathing room */}
      <main className="flex-1 p-4 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
