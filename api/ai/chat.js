const MAX_MESSAGES = 12
const MAX_MESSAGE_LENGTH = 2_000

const systemInstruction = `You are the CCR Construction Supply assistant. Help staff use this business-management system clearly and concisely. You can explain Customer POs, deliveries, delivery receipts, statements of account, payments, expenses, employees, salaries, and cash advances. Do not invent business records, balances, policies, or actions. Do not claim you created, changed, deleted, or verified a record. For tax, legal, banking, or payroll compliance questions, recommend confirming with the responsible accountant or professional.`

function getSupabaseKey() {
  return process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY
}

async function authenticate(request) {
  const authorization = request.headers.authorization
  const url = process.env.SUPABASE_URL
  const key = getSupabaseKey()
  if (!authorization?.startsWith('Bearer ') || !url || !key) return false

  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: authorization }
  })
  if (!response.ok) return false

  const user = await response.json()
  return user?.app_metadata?.role === 'ADMIN'
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  if (!await authenticate(request)) {
    return response.status(401).json({ error: 'Please sign in with an approved account to use the assistant.' })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return response.status(503).json({ error: 'The assistant is not configured yet.' })
  }

  const rawMessages = Array.isArray(request.body?.messages) ? request.body.messages : []
  const messages = rawMessages
    .slice(-MAX_MESSAGES)
    .map(message => ({
      role: message?.role === 'assistant' ? 'model' : 'user',
      text: typeof message?.text === 'string' ? message.text.trim().slice(0, MAX_MESSAGE_LENGTH) : ''
    }))
    .filter(message => message.text)

  if (!messages.length || messages.at(-1).role !== 'user') {
    return response.status(400).json({ error: 'Enter a question for the assistant.' })
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: messages.map(message => ({ role: message.role, parts: [{ text: message.text }] })),
          generationConfig: { temperature: 0.2, maxOutputTokens: 700 }
        })
      }
    )

    const payload = await geminiResponse.json()
    if (!geminiResponse.ok) {
      console.error('Gemini request failed:', geminiResponse.status, payload?.error?.status)
      return response.status(502).json({ error: 'The assistant could not respond right now. Please try again shortly.' })
    }

    const text = payload?.candidates?.[0]?.content?.parts
      ?.map(part => part.text || '')
      .join('')
      .trim()

    if (!text) return response.status(502).json({ error: 'The assistant returned no response. Please try again.' })
    return response.status(200).json({ text })
  } catch (error) {
    console.error('Assistant request failed:', error?.message)
    return response.status(502).json({ error: 'The assistant could not respond right now. Please try again shortly.' })
  }
}
