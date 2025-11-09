import { useEffect, useRef, useState } from 'react'

const GROUP_THEORY_SYSTEM_PROMPT = `You are Hypatia, a Socratic math tutor who teaches group theory through a dancing robot visualization.

=== CORE RULES (Follow in this priority order) ===

1. **SHORT MESSAGES**: Maximum 2 sentences per message. Ask ONE question, then WAIT.

2. **PREDICTION BEFORE ANIMATION**: 
   - When introducing a NEW sequence, ask "Where will X end up?" 
   - WAIT for student answer
   - Only THEN animate: "<reset><animate>X</animate>"
   
3. **ANIMATE INLINE WITH EXPLANATION**:
   - When student says "a" in step-by-step: immediately respond with "<animate>a</animate>"
   - Animation happens AT THE MOMENT you discuss each move
   - Not saved up for the end

4. **WRONG ANSWERS = NO ANIMATION**:
   - Guide them with smaller questions first
   - "How many a's? How many a⁻¹'s? What's 3 minus 2?"
   - Only animate AFTER they get it right

5. **USE <reset> BEFORE NEW SEQUENCES**:
   - Always start fresh: "<reset><animate>aaa</animate>"
   - Without reset, moves pile up incorrectly

=== MATHEMATICAL CONTEXT ===

**The Group ℤ (basic problems):**
- Generator: **a** (step left, position -1)
- Inverse: **a⁻¹** (step right, position +1)  
- Identity: **e** (position 0)
- Final position = (count of a's) - (count of a⁻¹'s)

**The Dihedral Group (with spin):**
- **s** = spin 180° (flips orientation, doesn't change position)
- Relations: s² = e and sas = a⁻¹
- Non-commutative: as ≠ sa (order matters!)

**Always frame problems formally:**
- "Let G = ℤ with generator a. Simplify: aaa(a⁻¹)(a⁻¹)"
- "Let G = ⟨a, s | s² = e, sas = a⁻¹⟩. Show that as ≠ sa"

=== TEACHING PATTERNS ===

**Pattern 1: Step-by-step walkthrough**
You: "We start at 0. What's first?"
Student: "a"
You: "Perfect! <animate>a</animate> Now at -1. Next?"
Student: "a"  
You: "Right! <animate>a</animate> At -2. Next?"

**Pattern 2: Prediction for new sequence**
You: "What about aaa(a⁻¹)(a⁻¹)? Where will we end?"
[WAIT]
Student: "-1"
You: "Let's check! <reset><animate>aaaa⁻¹a⁻¹</animate> Exactly right!"

**Pattern 3: Wrong answer handling**
Student: "5" (wrong)
You: "Let's think together. How many a's?"
Student: "3"
You: "And how many a⁻¹'s?"
Student: "2"
You: "So 3 minus 2 equals...?"
Student: "1"
You: "Right! Let's verify. <reset><animate>aaaa⁻¹a⁻¹</animate>"

**Pattern 4: Introducing spin**
Student: "What's s?"
You: "What do you think s means?"
Student: "spin?"
You: "Yes! Watch: <reset><animate>s</animate> See the flip?"
You: "Now let's try your problem. <reset>"

**Pattern 5: Comparisons**
You: "Where does aa(a⁻¹) end?"
Student: "-1"
You: "Let's see! <reset><animate>aaa⁻¹</animate> Right!"
You: "And just a?"
Student: "-1"  
You: "Yes! <reset><animate>a</animate> Same element, different expressions!"

=== KEY CONCEPTS TO TEACH ===

- **Cancellation**: aa⁻¹ = e (inverse property)
- **Reduction**: aaa(a⁻¹)(a⁻¹) simplifies to a
- **Non-commutativity**: as ≠ sa (with reflection, order matters!)
- **Conjugation**: sas = a⁻¹ (reflection flips direction)
- **Palindromes**: aa⁻¹aa⁻¹ reads same forwards/backwards

=== WHAT TO AVOID ===

❌ Walls of text (keep it to 2 sentences!)
❌ Animating before student predicts
❌ Animating wrong answers
❌ Explaining everything yourself (let THEM think!)
❌ Forgetting <reset> before new sequences

=== YOUR VOICE ===

Warm, encouraging, patient. Celebrate their thinking! This is for kids - make abstract algebra feel like a fun puzzle, not scary math.

Remember: You're teaching them to read REAL group theory notation by making it visual and playful. The scary symbols become friendly when you can see the robot dance them out!`


export default function ChatInterface({ onFirstMessage, onSpinEnabled }) {
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const timeoutsRef = useRef([])
  const messagesEndRef = useRef(null)
  const hasAskedFirstQuestion = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Helper function to convert a⁻¹ notation to internal format
  // Converts: a⁻¹ → 'b', (a⁻¹) → 'b', a^{-1} → 'b', a^-1 → 'b'
  const parseGroupNotation = (moveSequence) => {
    let parsed = moveSequence

    // Remove parentheses first
    parsed = parsed.replace(/[()]/g, '')

    // Replace various inverse notations with 'b' internally
    // Unicode superscript: a⁻¹
    parsed = parsed.replace(/a[⁻−-]\s*[¹1]/g, 'b')

    // LaTeX-style: a^{-1} or a^-1
    parsed = parsed.replace(/a\^\{-1\}/g, 'b')
    parsed = parsed.replace(/a\^-1/g, 'b')

    // Also handle capital A as a⁻¹ (common shorthand)
    parsed = parsed.replace(/A/g, 'b')

    // Filter to only valid characters
    const moves = parsed.split('').filter(c =>
      c === 'a' || c === 'b' || c === 's' || c === 'S'
    )

    return moves
  }

  const parseAndTriggerAnimations = (text) => {
    let processedText = text
    let delay = 500 // Base delay for first action

    // Check if reflection (s) is used and enable it
    if ((text.includes('S') || text.includes('s')) && text.includes('<animate>')) {
      const animateRegex = /<animate>(.*?)<\/animate>/g
      let match
      while ((match = animateRegex.exec(text)) !== null) {
        const moveSequence = match[1]
        if (moveSequence.toLowerCase().includes('s')) {
          onSpinEnabled?.(true)
          break
        }
      }
    }

    // Check for <reset> tags first
    const resetRegex = /<reset\s*\/?>/g
    const hasReset = resetRegex.test(processedText)

    if (hasReset) {
      console.log('[Hypatia] Resetting robot to position 0')
      setTimeout(() => {
        window.dispatchEvent(new Event('hypatia-group-theory-reset'))
      }, delay)
      delay += 300 // Add small delay after reset before animating

      // Remove reset tags from text
      processedText = processedText.replace(/<reset\s*\/?>/g, '')
    }

    // Look for <animate>...</animate> tags
    const animateRegex = /<animate>(.*?)<\/animate>/g
    let match
    let animationCount = 0

    // Reset regex to start from beginning
    animateRegex.lastIndex = 0

    while ((match = animateRegex.exec(text)) !== null) {
      const moveSequence = match[1]
      const moves = parseGroupNotation(moveSequence)

      if (moves.length > 0) {
        animationCount++
        console.log(`[Hypatia] Scheduling animation #${animationCount} at delay ${delay}ms:`, moves.join(''))
        console.log(`  Original notation: ${moveSequence}`)

        // Trigger animation with accumulated delay
        setTimeout(() => {
          console.log(`[Hypatia] Dispatching animation #${animationCount}`)
          window.dispatchEvent(new CustomEvent('hypatia-group-theory-animate', {
            detail: { moves }
          }))
        }, delay)

        // Add delay for next animation to prevent simultaneous triggers
        // Rough estimate: 500ms per move + 500ms buffer
        delay += (moves.length * 500) + 500
      }
    }

    if (animationCount > 0) {
      console.log(`[Hypatia] Total animations triggered: ${animationCount}`)
    }

    // Return text with animation tags highlighted, reset tags removed
    const cleanText = processedText.replace(/<animate>(.*?)<\/animate>/g, (match) => {
      const moves = match.replace(/<\/?animate>/g, '')
      return `**${moves}**`
    })

    return cleanText
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const messageToSend = inputValue.trim()
    console.log('💬 Sending message:', messageToSend)
    setInputValue('')

    // Create a clean copy of messages with only role and content
    const messagesForAPI = messages.map(m => ({
      role: m.role,
      content: String(m.content)
    }))

    const newUserMessage = { role: 'user', content: String(messageToSend) }
    console.log('Adding user message to state:', newUserMessage)
    setMessages((prev) => [...prev, newUserMessage])
    setIsLoading(true)

    // Show visualization on first message
    if (!hasAskedFirstQuestion.current) {
      hasAskedFirstQuestion.current = true
      onFirstMessage?.()
    }

    try {
      const requestBody = {
        messages: [
          ...messagesForAPI,
          { role: 'user', content: String(messageToSend) }
        ],
        systemPrompt: GROUP_THEORY_SYSTEM_PROMPT
      }

      console.log('Sending to API:', requestBody)

      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const cleanedContent = parseAndTriggerAnimations(data.message)

      const newAssistantMessage = { role: 'assistant', content: String(cleanedContent) }
      console.log('Adding assistant message to state:', newAssistantMessage)
      setMessages((prev) => [
        ...prev,
        newAssistantMessage
      ])
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Make sure the server is running on port 3001.'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-xl font-bold">Hypatia</h1>
        <p className="text-sm text-gray-400">Group Theory Tutor</p>
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
              className={`inline-block p-3 rounded-lg max-w-[85%] ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-100'
              }`}
            >
              {typeof msg.content === 'string' ? (
                msg.content.split('**').map((part, i) =>
                  i % 2 === 0 ? part : <strong key={i} className="text-cyan-300">{part}</strong>
                )
              ) : (
                String(msg.content)
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="text-left">
            <div className="inline-block p-3 rounded-lg bg-gray-800 text-gray-400">
              <span className="inline-block animate-pulse">Hypatia is thinking...</span>
            </div>
          </div>
        )}
        {messages.length === 0 && !isLoading && (
          <div className="text-gray-300 p-6">
            <h3 className="text-lg font-semibold mb-4 text-cyan-400">Ask me about group theory!</h3>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Reduction Problems:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("Let G = ℤ be the group of integers under addition, with generator a. Simplify: aaa(a⁻¹)(a⁻¹)")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    Let G = ℤ, simplify aaa(a⁻¹)(a⁻¹)
                  </button>
                  <button
                    onClick={() => setInputValue("Let G = ℤ with generator a. Reduce aa(a⁻¹)aa(a⁻¹) to simplest form")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    G = ℤ, reduce aa(a⁻¹)aa(a⁻¹)
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Element Equality:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("In the group ℤ with generator a, are aa(a⁻¹) and a equal as group elements?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    In ℤ: are aa(a⁻¹) and a equal?
                  </button>
                  <button
                    onClick={() => setInputValue("In the group ℤ with generator a, what is the inverse of aaa?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    In ℤ: inverse of aaa?
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Dihedral Group:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("Let G = ⟨a, s | s² = e, sas = a⁻¹⟩ be the dihedral group. Compute as")}
                    className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded transition-colors"
                  >
                    Dihedral: compute as
                  </button>
                  <button
                    onClick={() => setInputValue("Let G = ⟨a, s | s² = e, sas = a⁻¹⟩ be the dihedral group. Compute sa")}
                    className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded transition-colors"
                  >
                    Dihedral: compute sa
                  </button>
                  <button
                    onClick={() => setInputValue("Let G = ⟨a, s | s² = e, sas = a⁻¹⟩ be the dihedral group. Show that as ≠ sa")}
                    className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded transition-colors"
                  >
                    Dihedral: show as ≠ sa
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Advanced:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("In the group ℤ with generator a, show that a³a⁻² = a")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    In ℤ: show a³a⁻² = a
                  </button>
                  <button
                    onClick={() => setInputValue("In the dihedral group ⟨a, s | s² = e, sas = a⁻¹⟩, prove that s² = e")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    Dihedral: prove s² = e
                  </button>
                  <button
                    onClick={() => setInputValue("In the group ℤ with generator a, is the word aa⁻¹aa⁻¹ a palindrome?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    In ℤ: is aa⁻¹aa⁻¹ palindrome?
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about group theory..."
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}




