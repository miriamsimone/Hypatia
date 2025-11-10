import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { messages, systemPrompt } = req.body

    // Try the most recent Sonnet model - fallback to older if needed
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

        return res.status(200).json({ message: result.text })
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
    res.status(500).json({
      error: 'Failed to generate response',
      details: error.message,
      errorType: error.constructor.name,
      suggestion: 'Check /api/models endpoint to see available models'
    })
  }
}
