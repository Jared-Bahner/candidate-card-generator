import { buildHighlightPrompt, getOpenAIClient } from './_openai.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { sanitizedText, context = '', strictPrivacy = false } = req.body || {};
    if (!sanitizedText || typeof sanitizedText !== 'string') {
      res.status(400).json({ error: 'Invalid request payload' });
      return;
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: buildHighlightPrompt(context, Boolean(strictPrivacy))
        },
        {
          role: 'user',
          content: sanitizedText
        }
      ],
      temperature: strictPrivacy ? 0.4 : 0.7,
      max_tokens: 1000
    });

    const highlightsText = response.choices?.[0]?.message?.content || '';
    res.status(200).json({ data: { highlightsText } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    const normalizedMessage = message.includes('has been deprecated')
      ? 'Our AI service is being upgraded. Please try again in a few minutes.'
      : message;

    res.status(500).json({ error: normalizedMessage });
  }
}
