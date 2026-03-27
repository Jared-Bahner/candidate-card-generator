import { buildResumeParserPrompt, getOpenAIClient } from './_openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { sanitizedText } = req.body || {};
    if (!sanitizedText || typeof sanitizedText !== 'string') {
      res.status(400).json({ error: 'Invalid request payload' });
      return;
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: buildResumeParserPrompt()
        },
        {
          role: 'user',
          content: sanitizedText
        }
      ],
      temperature: 0,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const parsedData = JSON.parse(response.choices?.[0]?.message?.content || '{}');
    res.status(200).json({ data: parsedData });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    const normalizedMessage = message.includes('has been deprecated')
      ? 'Our AI service is being upgraded. Please try again in a few minutes.'
      : message;

    res.status(500).json({ error: normalizedMessage });
  }
}
