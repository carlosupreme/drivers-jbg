import { useEffect, useRef } from 'react'

interface SignaturePadProps {
  hasValue: boolean
  onChange: (dataUrl: string | null) => void
}

/** Freehand signature capture on a canvas — works with touch, pen, and mouse via Pointer Events. */
export function SignaturePad({ hasValue, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const drawingRef = useRef(false)
  const hasDrawnRef = useRef(false)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#111827'
  }, [])

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d')
    const point = getPoint(event)
    if (!ctx || !point) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drawingRef.current = true
    ctx.beginPath()
    ctx.moveTo(point.x, point.y)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const ctx = canvasRef.current?.getContext('2d')
    const point = getPoint(event)
    if (!ctx || !point) return
    ctx.lineTo(point.x, point.y)
    ctx.stroke()
    hasDrawnRef.current = true
  }

  const handlePointerUp = () => {
    if (!drawingRef.current) return
    drawingRef.current = false
    if (hasDrawnRef.current) {
      onChange(canvasRef.current?.toDataURL('image/png') ?? null)
    }
  }

  const handleClear = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasDrawnRef.current = false
    onChange(null)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <canvas
        ref={canvasRef}
        width={320}
        height={140}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="border-input bg-background h-36 w-full touch-none rounded-md border"
      />
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">
          {hasValue ? 'Firma capturada' : 'Pide al cliente que firme aquí'}
        </span>
        <button
          type="button"
          onClick={handleClear}
          className="text-muted-foreground text-xs font-medium underline"
        >
          Limpiar
        </button>
      </div>
    </div>
  )
}
