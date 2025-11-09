import { useState } from 'react'
import GroupTheoryScene from './components/GroupTheoryScene'
import ChatInterface from './components/ChatInterface'

function App() {
  const [showVisualization, setShowVisualization] = useState(false)
  const [spinEnabled, setSpinEnabled] = useState(false)

  return (
    <div className="w-full h-screen flex">
      {/* Left side: 3D Scene (hidden until first question) */}
      <div className={`flex-1 relative ${showVisualization ? '' : 'hidden'}`}>
        <GroupTheoryScene spinEnabled={spinEnabled} />
      </div>

      {/* Right side: Chat Interface (full width when visualization hidden) */}
      <div className={`bg-gray-900 border-l border-gray-800 ${showVisualization ? 'w-96' : 'w-full'}`}>
        <ChatInterface
          onFirstMessage={() => setShowVisualization(true)}
          onSpinEnabled={(enabled) => setSpinEnabled(enabled)}
        />
      </div>
    </div>
  )
}

export default App





