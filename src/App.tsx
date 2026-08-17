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
  width: 'calc(100% - 16px)',
  height: 'calc(100% - 16px)',
  maxWidth: 900,
  maxHeight: 1200,
  background: '#1e1b18',
  borderRadius: 6,
  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.4)',
  border: '2px solid #2a2622',
  overflow: 'hidden',
  position: 'relative',
  touchAction: 'none',
}

const slateInnerStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  position: 'relative',
  background: '#2a2622',
  // Subtle noise texture via CSS
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
