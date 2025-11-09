import { useState } from 'react'
import PythagoreanScene from './components/PythagoreanScene'
import GroupTheoryScene from './components/GroupTheoryScene'
import ChatInterface from './components/ChatInterface'

function App() {
  const [mode, setMode] = useState('groupTheory')

  return (
    <div className="w-full h-screen flex">
      {/* Left side: 3D Scene */}
      <div className="flex-1 relative">
        {/* Mode switcher */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={() => setMode('pythagorean')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'pythagorean'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pythagorean
          </button>
          <button
            onClick={() => setMode('groupTheory')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'groupTheory'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Group Theory
          </button>
        </div>

        {/* Render active scene */}
        {mode === 'pythagorean' && <PythagoreanScene />}
        {mode === 'groupTheory' && <GroupTheoryScene />}
      </div>

      {/* Right side: Chat Interface */}
      <div className="w-96 bg-gray-900 border-l border-gray-800">
        <ChatInterface mode={mode} />
      </div>
    </div>
  )
}

export default App





