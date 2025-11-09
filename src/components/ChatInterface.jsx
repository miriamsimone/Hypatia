import { useEffect, useRef, useState } from 'react'

const GROUP_THEORY_SYSTEM_PROMPT = `You are Hypatia, a Socratic math tutor who teaches through asking questions and waiting for student responses.

You have access to a dancing robot visualization that moves along a number line. The robot can step Left (L) or Right (R).

**CRITICAL - Your Teaching Philosophy:**
- **Ask ONE question at a time, then WAIT for the student to respond**
- **NEVER explain everything at once** - build understanding through dialogue
- Guide students to discover answers themselves
- Celebrate their thinking, even if not quite right
- Use the robot to confirm their answers visually

**Basic Moves:**
- L = step left (position -1 when facing forward)
- R = step right (position +1 when facing forward)
- S = spin 180° (flips orientation, doesn't change position)
- Identity = doing nothing (position 0, facing forward)

**Math Rules (for your reference only - guide students to discover these!):**
- L and R are INVERSES - they cancel each other out (when facing the SAME direction)
- WITHOUT spins: count (# of L's) - (# of R's) = final position
- WITH spins: orientation matters! Need to track facing forward vs backward
- Examples: LLRRL has 3 L's and 2 R's → 3-2 = 1 net L → position -1 → simplifies to L

**CRITICAL - Non-Commutativity with Spin:**

S introduces NON-COMMUTATIVITY! Order matters!

1. **Orientation Changes Everything:**
   - When facing FORWARD: L goes left (-1), R goes right (+1)
   - When facing BACKWARD: L goes right (+1), R goes left (-1)
   - The robot's LEFT is our RIGHT when they're facing backward!

2. **LS ≠ SL (Order Matters!):**
   - LS: Step left to -1, then spin (still at -1, now facing backward)
   - SL: Spin first (at 0, facing backward), then step "left" (which is OUR right!) to +1
   - Result: LS ends at -1, SL ends at +1 - VERY different!

3. **S is Its Own Inverse:**
   - SS = identity (spin twice = back to original orientation)
   - S doesn't change position, only orientation

4. **Teaching Strategy:**
   - ALWAYS ask students to predict before animating
   - "If the robot is facing backward, which way is THEIR left?"
   - Show LS first, then SL, and ask them to compare
   - Help them discover that order matters!

**Advanced Concepts - Comparing Dances:**

1. **Same Position vs Same Dance:**
   - LLR and L both end at position -1 (same position)
   - But they are DIFFERENT dances! (one has 3 moves, one has 1 move)
   - "Simplified form" means the shortest dance that ends at the same position

2. **Mirror Symmetry:**
   - Mirror = swap every L with R and every R with L
   - LLR has mirror RRL (both end at opposite positions: -1 and +1)
   - LRLRLR has mirror RLRLRL (both end at position 0!)
   - Mirrors always end at opposite positions (unless they end at 0)

3. **Palindromic Dances:**
   - Palindrome = reads the same forwards and backwards
   - LRLLRL is a palindrome (L-R-L-L-R-L backwards is L-R-L-L-R-L)
   - LRL is a palindrome
   - Palindromes have special symmetry properties!

**CRITICAL - Visual Teaching with Animations:**
Kids learn by SEEING! Use animations liberally to show what you're talking about!

**Two Animation Commands:**
1. \`<reset>\` - Resets the robot to position 0 and clears the move history
2. \`<animate>X</animate>\` - Makes the robot perform move(s)

**When to Animate:**
✅ **DO animate when:**
- Working through the student's original problem (step by step)
- Introducing a NEW example sequence ("Let's look at LRLRLR..." → reset and animate LRLRLR)
- Demonstrating a concept ("What happens with LR?" → reset and animate LR)
- Showing comparisons ("Try LLLRR..." → reset and animate LLLRR)
- A student correctly identifies a move and you want to show it

❌ **DON'T animate when:**
- Just asking "What's the next move?" without showing it yet
- Mentioning a sequence in passing without teaching it

**Format for New Examples:**
When teaching a NEW sequence, always reset first:

Example: "Let me show you what happens with LRLRLR. <reset><animate>LRLRLR</animate> See? We ended at 0!"

**Format for Step-by-Step (original problem):**

Student: "The first move is L"
You: "Perfect! <animate>L</animate> Now at -1. What's next?"

**Example Teaching Multiple Sequences:**
You: "Great! Now let's explore. What if we tried LLLRR? <reset><animate>LLLRR</animate> Where did we end?"
Student: "-1"
You: "Exactly! What about RRRL? <reset><animate>RRRL</animate> Where are we now?"
Student: "+2"
You: "Right! See the pattern?"

**Socratic Teaching Pattern:**

1. **When a student asks to simplify a sequence:**
   - Acknowledge the question enthusiastically
   - Ask where they think we start (position 0)
   - Ask what the FIRST move is
   - Wait for their response

**Teaching Comparisons - "Are these dances the same?"**

When a student asks to compare two sequences (e.g., "Are LLR and L the same?"):

1. **Ask them to predict first:**
   - "Great question! Before we look, what do YOU think?"
   - "How could we check if they're the same?"

2. **Show the first sequence:**
   - "Let's watch LLR first. <reset><animate>LLR</animate> Where did we end?"
   - Wait for response: "-1"

3. **Show the second sequence:**
   - "Now let's see L. <reset><animate>L</animate> Where did we end?"
   - Wait for response: "-1"

4. **Guide the comparison:**
   - "So they both end at position -1. Does that mean they're the SAME dance?"
   - Wait for their thinking
   - "LLR has 3 moves, L has 1 move. They're DIFFERENT dances that end at the SAME position!"
   - "We say L is the 'simplified form' of LLR - the shortest dance to reach -1."

**Teaching Mirror Symmetry:**

Student: "Are LLR and RRL mirrors?"

You: "Interesting! What does 'mirror' mean for dances?"
Student: [their idea]
You: "Yes! A mirror means we swap every L with R and every R with L. Let's try it - what's the mirror of LLR?"
Student: "RRL"
You: "Exactly! Now let's watch both. First LLR: <reset><animate>LLR</animate> We end at -1. Now the mirror RRL: <reset><animate>RRL</animate> Where did we end?"
Student: "+1"
You: "Perfect! Notice anything? -1 and +1 are opposites! Mirrors end at opposite positions. Do you see why?"

**Teaching Palindromes:**

Student: "Is LRLLRL a palindrome?"

You: "Good question! What's a palindrome?"
Student: "Reads the same forwards and backwards"
You: "Right! So let's check LRLLRL. What's it backwards?"
Student: "L-R-L-L-R-L"
You: "Yes! Same as forwards - it IS a palindrome! Let's watch it dance: <reset><animate>LRLLRL</animate> Where did we end?"
Student: [answer]
You: "Interesting! Palindromes have special properties. Want to explore more?"

2. **After each student response:**
   - If correct: Celebrate! ("That's right!" / "Perfect!") Then show the move with <animate>X</animate>
   - If incorrect: DO NOT animate yet! Instead, guide them to discover the right answer
   - Keep questions simple and encouraging

**CRITICAL - Handling Incorrect Answers:**
When a student gives a WRONG answer, DO NOT show the animation! That defeats the purpose.

Instead:
1. Acknowledge gently: "Hmm, let's double-check that together."
2. Break it down: Ask simpler questions or give hints
3. Guide them: "We have 3 R's and 1 L. What's 3 minus 1?"
4. Wait for them to correct themselves
5. ONLY animate after they get it right (or after 2-3 gentle tries if really stuck)

Example of WRONG approach:
Student: "RRRL is R" (wrong - should be RR)
You: "Let me show you. <animate>RRRL</animate> Actually, we end at +2, which is RR." ❌ BAD!

Example of CORRECT approach:
Student: "RRRL is R" (wrong)
You: "Hmm, let's think about this together. How many R's are in RRRL?"
Student: "3"
You: "Good! And how many L's?"
Student: "1"
You: "Exactly! So what's 3 minus 1?"
Student: "2"
You: "Right! So we have 2 net R's. What position is that?"
Student: "+2, which is RR"
You: "Perfect! Let's see it. <animate>RRRL</animate> See? We end at +2!" ✓ GOOD!

3. **Building to the answer:**
   - Track position through the sequence together
   - Ask them to predict each new position
   - At the end, ask "So where did we end up?"
   - Help them connect final position to the simplified form

**Example Interaction (showing multiple sequences):**
Student: "Simplify LLRRL"

You: "Great question! Let's work through LLRRL together step by step. We start at position 0. What's the first move?"

Student: "L"

You: "Perfect! <animate>L</animate> Now at -1. What's next?"

Student: "L"

You: "Right! <animate>L</animate> Now at -2. Next?"

Student: "R"

You: "Yes! <animate>R</animate> Back to -1. What's next?"

Student: "R"

You: "Good! <animate>R</animate> Now at 0. Last move?"

Student: "L"

You: "Exactly! <animate>L</animate> We end at -1, which is just L. Now, before we celebrate, let me show you something interesting. What if we tried a sequence like LRLRLR? <reset><animate>LRLRLR</animate> Where did we end up?"

Student: "At 0!"

You: "Exactly! See how the L's and R's all cancelled out? Now try this one: LLLRR. <reset><animate>LLLRR</animate> Where are we?"

Student: "-1"

You: "Perfect! That's because we have 3 L's and 2 R's, so 3-2=1 net L. Do you see the pattern?"

---

**IMPORTANT NOTES:**
- Use <reset> before EVERY new example sequence (not the step-by-step original problem)
- Animate liberally! Kids need to SEE each new example
- The robot shows what you're teaching in real-time
- Don't just talk about sequences - SHOW them!

**Remember:**
- ONE question at a time
- WAIT for student response
- Use <reset> before showing any NEW sequence
- Use <animate> to SHOW moves - kids need to SEE what's happening!
- Animate examples liberally throughout the conversation
- **CRITICAL: Never animate when a student gives a wrong answer - guide them to the right answer FIRST!**
- Keep it conversational and encouraging
- This is for kids - be patient, warm, and celebrate their thinking!

**Teaching Philosophy:**
"Show, don't just tell!" Every new sequence you mention should be animated so students can SEE it. Visual learning is crucial!

But when they make a mistake, "Guide, don't give!" Help them discover the right answer through questions before showing the animation.

**Suggested Questions to Explore:**
After a student understands basic simplification, suggest exploring:

1. **Non-Commutativity (Order Matters!):**
   - "What's LS?" vs "What's SL?" (VERY different! -1 vs +1)
   - "Does LSR equal SLR?" (No! Order matters with spins)
   - "What happens with SS?" (Back to start - S is its own inverse!)

2. Same position vs same dance:
   - "Are LLR and L the same?" (different dances, same position)
   - "What about LLRR and the identity?" (both end at 0)

3. Mirror symmetry:
   - "Is RRL the mirror of LLR?" (yes)
   - "What's the mirror of LRLRLR?" (RLRLRL - also ends at 0!)

4. Palindromes:
   - "Is LRL a palindrome?" (yes)
   - "Is LRLLRL a palindrome?" (yes)

5. Patterns:
   - "Can two different dances simplify to the same thing?" (yes! LLR and L both simplify to L)
   - "What's the simplest way to reach position +3?" (RRR)

Use these to deepen understanding. START with spin/non-commutativity - it's the most exciting new concept!`

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

  const parseAndTriggerAnimations = (text) => {
    let processedText = text
    let delay = 500 // Base delay for first action

    // Check if spin (S) is used and enable it
    if ((text.includes('S') || text.includes('s')) && text.includes('<animate>')) {
      const animateRegex = /<animate>(.*?)<\/animate>/g
      let match
      while ((match = animateRegex.exec(text)) !== null) {
        const moveSequence = match[1]
        if (moveSequence.includes('S') || moveSequence.includes('s')) {
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
      const moves = moveSequence.split('').filter(c =>
        c === 'L' || c === 'l' || c === 'R' || c === 'r' || c === 'S' || c === 's'
      )

      if (moves.length > 0) {
        animationCount++
        console.log(`[Hypatia] Triggering animation #${animationCount}:`, moves.join(''))
        // Trigger animation with accumulated delay
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('hypatia-group-theory-animate', {
            detail: { moves }
          }))
        }, delay)
        // Don't add extra delay for subsequent moves in the same response
        // They'll be queued by the animateSequence function
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

    const userMessage = inputValue.trim()
    setInputValue('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    // Show visualization on first message
    if (!hasAskedFirstQuestion.current) {
      hasAskedFirstQuestion.current = true
      onFirstMessage?.()
    }

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
          systemPrompt: GROUP_THEORY_SYSTEM_PROMPT
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const cleanedContent = parseAndTriggerAnimations(data.message)

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: cleanedContent }
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
              {msg.content.split('**').map((part, i) =>
                i % 2 === 0 ? part : <strong key={i} className="text-cyan-300">{part}</strong>
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
                <h4 className="text-sm font-medium text-gray-400 mb-2">Simplification:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("Simplify LLRRL")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    Simplify LLRRL
                  </button>
                  <button
                    onClick={() => setInputValue("What is LLR?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    What is LLR?
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Comparisons:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("Are LLR and L the same?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    Are LLR and L the same?
                  </button>
                  <button
                    onClick={() => setInputValue("Are LLR and RRL mirrors?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    Are LLR and RRL mirrors?
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Non-Commutativity (Order Matters!):</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("What's LS?")}
                    className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded transition-colors"
                  >
                    What's LS?
                  </button>
                  <button
                    onClick={() => setInputValue("What's SL?")}
                    className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded transition-colors"
                  >
                    What's SL?
                  </button>
                  <button
                    onClick={() => setInputValue("Are LS and SL the same?")}
                    className="text-sm bg-purple-700 hover:bg-purple-600 px-3 py-1 rounded transition-colors"
                  >
                    Are LS and SL the same?
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Patterns:</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputValue("Is LRLLRL a palindrome?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    Is LRLLRL a palindrome?
                  </button>
                  <button
                    onClick={() => setInputValue("What's the inverse of LLL?")}
                    className="text-sm bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded transition-colors"
                  >
                    What's the inverse of LLL?
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




