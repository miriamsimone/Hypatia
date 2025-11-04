import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body

    const result = await generateText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      system: systemPrompt,
      messages: messages,
    })

    res.json({ message: result.text })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to generate response' })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})

