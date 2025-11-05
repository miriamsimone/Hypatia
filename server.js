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

// Endpoint to fetch available models
app.get('/api/models', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
    })
    
    const data = await response.json()
    res.json(data)
  } catch (error) {
    console.error('Error fetching models:', error)
    res.status(500).json({ error: 'Failed to fetch models' })
  }
})

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, systemPrompt } = req.body

    // Try the most recent Sonnet model - fallback to older if needed
    // Current models: claude-sonnet-4-20250514, claude-opus-4-1-20250805
    // Also try: claude-3-5-sonnet-20241022 (older but might still work)
    const modelNames = [
      'claude-sonnet-4-20250514',  // Most recent Sonnet
      'claude-3-5-sonnet-20241022', // Fallback
      'claude-3-5-sonnet-20240620', // Older fallback
    ]
    
    let lastError = null
    for (const modelName of modelNames) {
      try {
        const result = await generateText({
          model: anthropic(modelName),
          system: systemPrompt,
          messages: messages,
        })

        return res.json({ message: result.text })
      } catch (error) {
        lastError = error
        console.log(`Model ${modelName} failed:`, error.message)
        // Continue to next model
      }
    }
    
    // If all models failed, throw the last error
    throw lastError || new Error('No models available')
  } catch (error) {
    console.error('Error:', error)
    console.error('Error details:', error.message)
    console.error('Full error:', error)
    res.status(500).json({ 
      error: 'Failed to generate response',
      details: error.message,
      errorType: error.constructor.name,
      suggestion: 'Check /api/models endpoint to see available models'
    })
  }
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
})


