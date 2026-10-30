export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Chatbot is not configured yet. Set GROQ_API_KEY in .env.local for local development or in Vercel project environment variables.' });
  }

  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  const context = typeof req.body?.context === 'string' ? req.body.context.slice(0, 8000) : '';
  if (!question) return res.status(400).json({ error: 'Please enter a question.' });
  if (question.length > 500) return res.status(400).json({ error: 'Please keep your question under 500 characters.' });

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        temperature: 0.4,
        max_tokens: 220,
        messages: [
          { role: 'system', content: 'You are a concise portfolio Q&A assistant. Answer questions using only the provided portfolio context. If the answer is not present, say you do not know. Never invent personal details. Keep replies under 90 words.\n\nPORTFOLIO CONTEXT:\n' + context },
          { role: 'user', content: question }
        ]
      })
    });
    const payload = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      // Log provider status and a short provider error for local/Vercel debugging; never log the API key.
      console.error('Groq API response:', upstream.status, payload?.error?.message || payload?.error?.type || 'No provider error details');
      const status = upstream.status === 429 ? 429 : 502;
      return res.status(status).json({ error: upstream.status === 429 ? 'The AI service is busy. Wait a moment and try again.' : 'The AI service could not answer right now. Please try again.' });
    }
    const answer = payload.choices?.[0]?.message?.content;
    if (typeof answer !== 'string' || !answer.trim()) return res.status(502).json({ error: 'The AI service returned an empty answer. Please try again.' });
    return res.status(200).json({ answer: answer.trim() });
  } catch (error) {
    console.error('Portfolio chat request failed:', error?.message || 'Unknown error');
    return res.status(502).json({ error: 'Could not reach the AI service. Please try again.' });
  }
}
