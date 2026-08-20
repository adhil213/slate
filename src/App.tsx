import { useState, useRef, useCallback } from 'react'
import SlateCanvas, { type SlateHandle } from './components/SlateCanvas'
import SlateControls from './components/SlateControls'
import type { Tool, ChalkColor, BoardMode } from './lib/types'

const appStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: '#3a3530',
  overflow: 'hidden',
  transition: 'background 0.3s',
}

const slateAreaStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  minHeight: 0,
}

const slateFrameStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  maxWidth: 900,
  padding: 12,
  background: `
    linear-gradient(180deg,
      #7a5232 0%, #6b4226 15%, #7a5232 30%,
      #5c3a20 50%, #6b4226 70%, #7a5232 85%, #5c3a20 100%
    )
  `,
  borderRadius: 8,
  boxShadow: `
    inset 0 1px 0 rgba(255,255,255,0.08),
    inset 0 -1px 0 rgba(0,0,0,0.3),
    0 4px 24px rgba(0,0,0,0.5)
  `,
  border: '2px solid #4a2e18',
  overflow: 'hidden',
  touchAction: 'none',
  boxSizing: 'border-box',
}

const slateInnerBlack: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  background: '#2a2622',
  borderRadius: 4,
  overflow: 'hidden',
  backgroundImage: `
    repeating-conic-gradient(rgba(255,255,255,0.012) 0% 25%, transparent 0% 50%) 0 0 / 3px 3px,
    repeating-conic-gradient(rgba(0,0,0,0.04) 0% 25%, transparent 0% 50%) 1px 1px / 3px 3px
  `,
}

const slateInnerWhite: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  background: '#f0ece6',
  borderRadius: 4,
  overflow: 'hidden',
  backgroundImage: `
    repeating-conic-gradient(rgba(0,0,0,0.008) 0% 25%, transparent 0% 50%) 0 0 / 3px 3px,
    repeating-conic-gradient(rgba(255,255,255,0.02) 0% 25%, transparent 0% 50%) 1px 1px / 3px 3px
  `,
}

export default function App() {
  const [tool, setTool] = useState<Tool>('chalk')
  const [chalkColor, setChalkColor] = useState<ChalkColor>('#e8e0d4')
  const [boardMode, setBoardMode] = useState<BoardMode>('black')
  const slateRef = useRef<SlateHandle>(null)

  const handleToolChange = useCallback((t: Tool) => {
    setTool(t)
    slateRef.current?.setTool(t)
  }, [])

  const handleColorChange = useCallback((c: ChalkColor) => {
    setChalkColor(c)
    setTool('chalk')
    slateRef.current?.setChalkColor(c)
    slateRef.current?.setTool('chalk')
  }, [])

  const handleBoardModeChange = useCallback((m: BoardMode) => {
    setBoardMode(m)
    slateRef.current?.setBoardMode(m)
  }, [])

  const handleClear = useCallback(() => {
    slateRef.current?.clearCanvas()
  }, [])

  return (
    <div style={{
      ...appStyle,
      background: boardMode === 'white' ? '#e8e4de' : '#3a3530',
    }}>
      <div style={slateAreaStyle}>
        <div style={slateFrameStyle}>
          <div style={boardMode === 'white' ? slateInnerWhite : slateInnerBlack}>
            <SlateCanvas ref={slateRef} boardMode={boardMode} />
          </div>
        </div>
      </div>
      <SlateControls
        tool={tool}
        chalkColor={chalkColor}
        boardMode={boardMode}
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onBoardModeChange={handleBoardModeChange}
        onClear={handleClear}
      />
    </div>
  )
}
