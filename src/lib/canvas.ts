const STORAGE_KEY = 'slate-data'
const SAVE_DEBOUNCE = 2000

let saveTimeout: ReturnType<typeof setTimeout> | null = null

export function scheduleSave(canvas: HTMLCanvasElement): void {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(() => {
    try {
      const dataUrl = canvas.toDataURL('image/png')
      localStorage.setItem(STORAGE_KEY, dataUrl)
    } catch {
      // storage full or unavailable — silently ignore
    }
  }, SAVE_DEBOUNCE)
}

export function restoreCanvas(canvas: HTMLCanvasElement): boolean {
  try {
    const dataUrl = localStorage.getItem(STORAGE_KEY)
    if (!dataUrl) return false

    const img = new Image()
    img.onload = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = dataUrl
    return true
  } catch {
    return false
  }
}

export function clearStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export function getCanvasScale(): number {
  const dpr = window.devicePixelRatio || 1
  // Cap at 2x to save memory on high-DPI phones
  return Math.min(dpr, 2)
}
