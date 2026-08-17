let audioCtx: AudioContext | null = null
let noiseBuffer: AudioBuffer | null = null
let gainNode: GainNode | null = null
let isPlaying = false
let muted = false

function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * 0.08
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3
  }
  return buffer
}

function ensureContext(): boolean {
  if (muted) return false
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  if (audioCtx.state === 'closed') return false
  return true
}

export function initAudio(): void {
  if (!ensureContext()) return
  if (audioCtx && !noiseBuffer) {
    noiseBuffer = createNoiseBuffer(audioCtx)
  }
}

export function startChalkSound(): void {
  if (!ensureContext() || !audioCtx || !noiseBuffer || isPlaying) return

  const source = audioCtx.createBufferSource()
  source.buffer = noiseBuffer
  source.loop = true

  const bandpass = audioCtx.createBiquadFilter()
  bandpass.type = 'bandpass'
  bandpass.frequency.value = 3000
  bandpass.Q.value = 0.8

  const highpass = audioCtx.createBiquadFilter()
  highpass.type = 'highpass'
  highpass.frequency.value = 800
  highpass.Q.value = 0.3

  gainNode = audioCtx.createGain()
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime)
  gainNode.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.05)

  source.connect(bandpass)
  bandpass.connect(highpass)
  highpass.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  source.start()
  isPlaying = true
}

export function stopChalkSound(): void {
  if (!isPlaying || !gainNode || !audioCtx) return
  const g = gainNode
  g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.08)
  setTimeout(() => {
    try { g.disconnect() } catch {}
  }, 120)
  isPlaying = false
  gainNode = null
}

export function setMuted(value: boolean): void {
  muted = value
  if (value) {
    stopChalkSound()
  }
}

export function isMuted(): boolean {
  return muted
}
