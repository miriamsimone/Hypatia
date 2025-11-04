import { useState } from 'react'
import Scene3D from './components/Scene3D'
import ChatInterface from './components/ChatInterface'

function App() {
  return (
    <div className="w-full h-screen flex">
      {/* Left side: 3D Scene */}
      <div className="flex-1 relative">
        <Scene3D />
      </div>
      
      {/* Right side: Chat Interface */}
      <div className="w-96 bg-gray-900 border-l border-gray-800">
        <ChatInterface />
      </div>
    </div>
  )
}

export default App

