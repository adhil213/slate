import { useState, useCallback, useEffect } from 'react'
import { setMuted, isMuted, initAudio } from '../lib/audio'
import { clearStorage } from '../lib/canvas'
import { CHALK_COLORS, type Tool, type ChalkColor } from '../lib/types'

interface SlateControlsProps {
  tool: Tool
  chalkColor: ChalkColor
  onToolChange: (tool: Tool) => void
  onColorChange: (color: ChalkColor) => void
  onClear: () => void
}

const barStyle: React.CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  padding: '10px 14px',
  background: '#322d28',
  borderTop: '1px solid rgba(255,255,255,0.06)',
}

const btnBase: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 10,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#c8bfb0',
  background: 'rgba(255,255,255,0.06)',
  transition: 'background 0.15s, color 0.15s',
  flexShrink: 0,
}

const btnActive: React.CSSProperties = {
  ...btnBase,
  background: 'rgba(200,191,176,0.18)',
  color: '#fff',
}

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 28,
  background: 'rgba(255,255,255,0.1)',
  flexShrink: 0,
}

const colorDot = (color: string, active: boolean): React.CSSProperties => ({
  width: 30,
  height: 30,
  borderRadius: '50%',
  background: color,
  border: active ? '2.5px solid rgba(255,255,255,0.85)' : '2px solid rgba(255,255,255,0.15)',
  boxShadow: active ? `0 0 10px ${color}` : 'none',
  transition: 'border 0.15s, box-shadow 0.15s',
  cursor: 'pointer',
  flexShrink: 0,
  padding: 0,
})

export default function SlateControls({ tool, chalkColor, onToolChange, onColorChange, onClear }: SlateControlsProps) {
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
    <div style={barStyle}>
      {CHALK_COLORS.map((c) => (
        <button
          key={c}
          onClick={() => onColorChange(c)}
          style={colorDot(c, chalkColor === c && tool === 'chalk')}
          aria-label={`Chalk color ${c}`}
          title={c}
        />
      ))}

      <div style={dividerStyle} />

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
          background: showConfirm ? 'rgba(180,60,40,0.5)' : 'rgba(255,255,255,0.06)',
          width: 'auto',
          padding: '0 14px',
          fontSize: 13,
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

      <div style={dividerStyle} />

      <button
        onClick={toggleMute}
        style={btnBase}
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
  )
}
