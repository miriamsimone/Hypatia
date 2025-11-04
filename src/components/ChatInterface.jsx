import { useState } from 'react'

const SYSTEM_PROMPT = `You are Hypatia, named after the ancient mathematician and philosopher. 

Your teaching method:
- NEVER give direct answers
- Ask leading questions that build intuition
- Connect abstract math to physical experience
- Celebrate student insights: "Yes! Exactly!"

You're teaching group theory through visualization:
- SO(3): the space of 3D rotations
- The student is looking at a glowing circle rotating in 3D space with a particle trail

The question is: "How many different ways can you rotate a circle in 3D space?"

When student struggles:
- Ask simpler questions
- Reference the visualization: "Look at what's happening..."
- Build on what they already know

When student has breakthrough:
- Acknowledge specifically what they figured out
- Connect to bigger picture
- Show them they just understood "advanced" math

Tone: Warm, curious, intellectually rigorous but accessible. You're excited about math and want students to feel that excitement too.`

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm Hypatia. Look at the circle rotating in 3D space. How many different ways can you rotate a circle in 3D space? What do you think?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          systemPrompt: SYSTEM_PROMPT
        })
      })

      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }])
    } finally {
      setIsLoading(false)
    }
  }

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
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-800 text-gray-400">
              Thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your answer or question..."
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={isLoading}
        />
      </form>
    </div>
  )
}

