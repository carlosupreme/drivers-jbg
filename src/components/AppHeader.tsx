import { Link } from '@tanstack/react-router'
import { Truck } from 'lucide-react'

export default function AppHeader() {
  return (
    <header className="border-border bg-card sticky top-0 z-10 flex items-center border-b px-4 py-3">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <Truck className="text-primary size-5" />
        <span>JBG Drivers</span>
      </Link>
    </header>
  )
}
