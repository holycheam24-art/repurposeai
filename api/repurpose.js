export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { text, platforms } = req.body;
  
  const HINTS = {
    twitter: "Punchy thread • 280 chars/tweet • hook + value + CTA",
    instagram: "Caption + hashtags • storytelling • visual hook",
    facebook: "Conversational post • longer form • community feel",
    youtube: "Video description + title ideas + tags"
  };

  const prompt = `You are a world-class social media content strategist. Repurpose this content into platform-optimized posts.\n\nCONTENT:\n"""\n${text}\n"""\n\nPLATFORMS:\n${platforms.map(p => `- ${p}: ${HINTS[p]}`).join('\n')}\n\nReturn ONLY valid JSON with platform IDs as keys and post content as string values. No markdown, no explanation.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json();
  const text2 = data.content?.map(c => c.text || '').join('') || '';
  const parsed = JSON.parse(text2.replace(/```json|```/g, '').trim());
  
  res.status(200).json(parsed);
}
