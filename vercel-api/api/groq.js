export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Groq key not configured' });
    return;
  }

  const { prompt, model } = req.body || {};

  if (typeof prompt !== 'string' || !prompt.trim()) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }

  try {
    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content:
              'أنت وكيل خدمة عملاء عربي متخصص في الحج والعمرة. أجب بدقة بالعربية، مختصرًا وواضحًا، وركز على المعلومات العملية فقط.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const text = await upstream.text();
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: text });
      return;
    }

    const payload = JSON.parse(text);
    res.json({
      content: payload?.choices?.[0]?.message?.content?.trim() || null,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}
