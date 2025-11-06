import { useEffect, useRef, useState } from 'react'

const SCRIPT = [
  {
    role: 'user',
    content: 'My teacher says I have to find a palindrome number. Can you tell me a palindrome number?',
    delay: 4.6,
  },
  {
    role: 'assistant',
    content:
      "I could tell you one, but what if I showed you something more interesting? What do you think makes a number a palindrome?",
    delay: 6.8,
  },
  {
    role: 'user',
    content: 'It reads the same backwards?',
    delay: 6.2,
  },
  {
    role: 'assistant',
    content: 'Exactly! Watch these colored orbs...',
    delay: 7.2,
    triggerOrbSequence: true,
  },
  {
    role: 'assistant',
    content:
      "See how we started at red, went to blue, then back to red? That's symmetry - just like a palindrome!",
    delay: 8,
  },
]

export default function ChatInterface() {
  const [messages, setMessages] = useState([])
  const timeoutsRef = useRef([])

  useEffect(() => {
    const scheduleStep = (index) => {
      if (index >= SCRIPT.length) return
      const step = SCRIPT[index]

      const timeoutId = window.setTimeout(() => {
        setMessages((prev) => [...prev, { role: step.role, content: step.content }])
        if (step.triggerOrbSequence) {
          window.dispatchEvent(new Event('hypatia-orb-sequence'))
        }
        scheduleStep(index + 1)
      }, step.delay * 1000)

      timeoutsRef.current.push(timeoutId)
    }

    const initialTimeout = window.setTimeout(() => scheduleStep(0), 400)
    timeoutsRef.current.push(initialTimeout)

    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id))
      timeoutsRef.current = []
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Hypatia</h1>
        <p className="text-sm text-gray-400">Socratic Math Tutor</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${
              msg.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-gray-500">Loading scripted conversation...</div>
        )}
      </div>

      <div className="p-4 border-t border-gray-800 text-sm text-gray-500">
        Scripted demo conversation. User input disabled for this prototype.
      </div>
    </div>
  )
}




