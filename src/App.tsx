import { useState, useRef, useCallback } from 'react'
import SlateCanvas, { type SlateHandle, type Tool } from './components/SlateCanvas'
import SlateControls from './components/SlateControls'

const appStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#3a3530',
  overflow: 'hidden',
  position: 'relative',
}

const slateFrameStyle: React.CSSProperties = {
  width: 'calc(100% - 28px)',
  height: 'calc(100% - 28px)',
  maxWidth: 900,
  maxHeight: 1200,
  padding: 14,
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
  position: 'relative',
  touchAction: 'none',
  boxSizing: 'border-box',
}

const slateInnerStyle: React.CSSProperties = {
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

export default function App() {
  const [tool, setTool] = useState<Tool>('chalk')
  const slateRef = useRef<SlateHandle>(null)

  const handleToolChange = useCallback((t: Tool) => {
    setTool(t)
    slateRef.current?.setTool(t)
  }, [])

  const handleClear = useCallback(() => {
    slateRef.current?.clearCanvas()
  }, [])

  return (
    <div style={appStyle}>
      <div style={slateFrameStyle}>
        <div style={slateInnerStyle}>
          <SlateCanvas ref={slateRef} />
          <SlateControls
            tool={tool}
            onToolChange={handleToolChange}
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  )
}
