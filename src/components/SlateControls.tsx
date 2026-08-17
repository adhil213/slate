import { useState, useCallback, useEffect } from 'react'
import { setMuted, isMuted, initAudio } from '../lib/audio'
import { clearStorage } from '../lib/canvas'
import type { Tool } from './SlateCanvas'

interface SlateControlsProps {
  tool: Tool
  onToolChange: (tool: Tool) => void
  onClear: () => void
}

const btnBase: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 8,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 18,
  color: '#c8bfb0',
  background: 'rgba(0,0,0,0.25)',
  backdropFilter: 'blur(2px)',
  transition: 'background 0.15s, color 0.15s',
  flexShrink: 0,
}

const btnActive: React.CSSProperties = {
  ...btnBase,
  background: 'rgba(200,191,176,0.18)',
  color: '#fff',
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: 12,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 8,
  alignItems: 'center',
  zIndex: 10,
}

const soundStyle: React.CSSProperties = {
  position: 'absolute',
  top: 10,
  right: 10,
  zIndex: 10,
}

export default function SlateControls({ tool, onToolChange, onClear }: SlateControlsProps) {
  const [muted, setMutedState] = useState(isMuted())
  const [showConfirm, setShowConfirm] = useState(false)

  const toggleMute = useCallback(() => {
    const next = !muted
    setMutedState(next)
    setMuted(next)
    if (!next) initAudio()
  }, [muted])

  const handleClear = useCallback(() => {
    if (showConfirm) {
      onClear()
      clearStorage()
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }, [showConfirm, onClear])

  useEffect(() => {
    setMuted(isMuted())
  }, [])

  return (
    <>
      <div
        style={soundStyle}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={toggleMute}
          style={{
            ...btnBase,
            background: 'rgba(0,0,0,0.3)',
          }}
          aria-label={muted ? 'Unmute chalk sound' : 'Mute chalk sound'}
          title={muted ? 'Sound off' : 'Sound on'}
        >
          {muted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>

      <div
        style={containerStyle}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onToolChange(tool === 'chalk' ? 'eraser' : 'chalk')}
          style={tool === 'eraser' ? btnActive : btnBase}
          aria-label={tool === 'chalk' ? 'Switch to eraser' : 'Switch to chalk'}
          title={tool === 'chalk' ? 'Eraser' : 'Chalk'}
        >
          {tool === 'chalk' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.8 1.4c.8-.8 2-.8 2.8 0l5 5c.8.8.8 2 0 2.8L11 20" />
              <path d="M6 12l6-6" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 20H7L3 16c-.8-.8-.8-2 0-2.8L14.8 1.4c.8-.8 2-.8 2.8 0l5 5c.8.8.8 2 0 2.8L11 20" />
            </svg>
          )}
        </button>

        <button
          onClick={handleClear}
          style={{
            ...btnBase,
            background: showConfirm ? 'rgba(180,60,40,0.5)' : 'rgba(0,0,0,0.25)',
            fontSize: 13,
            width: 'auto',
            padding: '0 14px',
            fontWeight: 500,
          }}
          aria-label={showConfirm ? 'Confirm clear' : 'Clear slate'}
          title={showConfirm ? 'Tap again to clear' : 'Clear'}
        >
          {showConfirm ? 'Clear?' : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          )}
        </button>
      </div>
    </>
  )
}
