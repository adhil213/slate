import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react'
import { scheduleSave, restoreCanvas, getCanvasScale } from '../lib/canvas'
import { initAudio, startChalkSound, stopChalkSound } from '../lib/audio'
import type { Tool, ChalkColor, BoardMode } from '../lib/types'

export interface SlateHandle {
  setTool: (tool: Tool) => void
  setChalkColor: (color: ChalkColor) => void
  setBoardMode: (mode: BoardMode) => void
  clearCanvas: () => void
  resize: () => void
}

interface SlateCanvasProps {
  boardMode: BoardMode
}

const SlateCanvas = forwardRef<SlateHandle, SlateCanvasProps>(function SlateCanvas({ boardMode }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const toolRef = useRef<Tool>('chalk')
  const chalkColorRef = useRef<ChalkColor>('#e8e0d4')
  const boardModeRef = useRef<BoardMode>('black')
  const lastPosRef = useRef({ x: 0, y: 0 })
  const chalkWidthRef = useRef(3)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const restoredRef = useRef(false)

  boardModeRef.current = boardMode

  const resolveChalkColor = useCallback(() => {
    if (boardModeRef.current === 'white' && chalkColorRef.current === '#e8e0d4') {
      return '#2a2622'
    }
    return chalkColorRef.current
  }, [])

  const resize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = ctxRef.current
    if (!ctx) return

    const scale = getCanvasScale()
    const rect = canvas.getBoundingClientRect()
    const newW = Math.round(rect.width * scale)
    const newH = Math.round(rect.height * scale)

    if (newW === canvas.width && newH === canvas.height) return

    const offscreen = document.createElement('canvas')
    offscreen.width = canvas.width
    offscreen.height = canvas.height
    offscreen.getContext('2d')!.drawImage(canvas, 0, 0)

    canvas.width = newW
    canvas.height = newH

    ctx.drawImage(offscreen, 0, 0)
    chalkWidthRef.current = Math.max(2, 3 * scale)
  }, [])

  const setupChalk = useCallback((ctx: CanvasRenderingContext2D) => {
    const color = resolveChalkColor()
    ctx.globalCompositeOperation = 'source-over'
    ctx.strokeStyle = color
    ctx.fillStyle = color
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = chalkWidthRef.current
    ctx.globalAlpha = 0.85
  }, [resolveChalkColor])

  const setupEraser = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.globalCompositeOperation = 'destination-out'
    ctx.globalAlpha = 1
    ctx.lineWidth = chalkWidthRef.current * 6
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const getCanvasPos = useCallback((e: globalThis.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scale = getCanvasScale()
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { willReadFrequently: false })
    ctxRef.current = ctx
    if (!ctx) return

    const scale = getCanvasScale()
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * scale
    canvas.height = rect.height * scale
    chalkWidthRef.current = Math.max(2, 3 * scale)

    if (!restoredRef.current) {
      restoredRef.current = true
      restoreCanvas(canvas)
    }

    const drawChalkSegment = (x0: number, y0: number, x1: number, y1: number) => {
      const dx = x1 - x0
      const dy = y1 - y0
      const dist = Math.sqrt(dx * dx + dy * dy)
      const speed = Math.min(dist / 4, 1)
      const color = resolveChalkColor()

      ctx.globalAlpha = 0.55 + speed * 0.35
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = chalkWidthRef.current * (0.85 + speed * 0.3)

      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.lineTo(x1, y1)
      ctx.stroke()

      if (speed < 0.6 && Math.random() < 0.15) {
        ctx.globalAlpha = 0.2 + Math.random() * 0.15
        const offsetX = (Math.random() - 0.5) * chalkWidthRef.current * 3
        const offsetY = (Math.random() - 0.5) * chalkWidthRef.current * 3
        ctx.beginPath()
        ctx.arc(x1 + offsetX, y1 + offsetY, Math.random() * 1.5 + 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const onPointerDown = (e: globalThis.PointerEvent) => {
      if (e.button !== 0) return
      e.preventDefault()
      drawingRef.current = true
      const pos = getCanvasPos(e)
      lastPosRef.current = pos

      initAudio()
      if (toolRef.current === 'chalk') {
        startChalkSound()
        setupChalk(ctx)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, chalkWidthRef.current * 0.5, 0, Math.PI * 2)
        ctx.fill()
      } else {
        setupEraser(ctx)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, chalkWidthRef.current * 3, 0, Math.PI * 2)
        ctx.fill()
      }

      canvas.setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: globalThis.PointerEvent) => {
      if (!drawingRef.current) return
      e.preventDefault()

      const pos = getCanvasPos(e)
      const last = lastPosRef.current

      if (toolRef.current === 'chalk') {
        drawChalkSegment(last.x, last.y, pos.x, pos.y)
      } else {
        ctx.globalCompositeOperation = 'destination-out'
        ctx.globalAlpha = 1
        ctx.lineWidth = chalkWidthRef.current * 6
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.beginPath()
        ctx.moveTo(last.x, last.y)
        ctx.lineTo(pos.x, pos.y)
        ctx.stroke()
      }

      lastPosRef.current = pos
    }

    const onPointerUp = (_e: globalThis.PointerEvent) => {
      if (!drawingRef.current) return
      drawingRef.current = false
      stopChalkSound()
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      scheduleSave(canvas)
    }

    const onContextMenu = (e: Event) => e.preventDefault()

    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('contextmenu', onContextMenu)

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(canvas.parentElement!)

    return () => {
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('contextmenu', onContextMenu)
      resizeObserver.disconnect()
    }
  }, [resize, getCanvasPos, setupChalk, setupEraser, resolveChalkColor])

  useImperativeHandle(ref, () => ({
    setTool: (tool: Tool) => {
      toolRef.current = tool
      const ctx = ctxRef.current
      if (!ctx) return
      if (tool === 'chalk') {
        setupChalk(ctx)
      } else {
        setupEraser(ctx)
      }
    },
    setChalkColor: (color: ChalkColor) => {
      chalkColorRef.current = color
      const ctx = ctxRef.current
      if (ctx && toolRef.current === 'chalk') {
        setupChalk(ctx)
      }
    },
    setBoardMode: (mode: BoardMode) => {
      boardModeRef.current = mode
    },
    clearCanvas: () => {
      const canvas = canvasRef.current
      const ctx = ctxRef.current
      if (!ctx || !canvas) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      scheduleSave(canvas)
    },
    resize,
  }))

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        touchAction: 'none',
        cursor: 'crosshair',
      }}
      role="img"
      aria-label="Interactive slate writing area"
    />
  )
})

export default SlateCanvas
