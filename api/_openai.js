import OpenAI from 'openai';

export function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Server is missing OPENAI_API_KEY.');
  }

  return new OpenAI({ apiKey });
}

export function buildResumeParserPrompt() {
  return `You are a professional resume parser. Extract the following information from the resume in a structured JSON format:
          - name (full name)
          - position (current or most recent job title)
          - email
          - phone
          - address (full address if available)
          - linkedin (LinkedIn URL if found)
          - resumeLink (any other portfolio or resume links)
          - coreSkills (array of 3 most important technical skills)
          - highlights (array of 5-7 detailed achievements/experiences, each 2-3 sentences long, focusing on quantifiable results and impact)

          PRIVACY REQUIREMENTS:
          - The resume text may include placeholders like [CANDIDATE_NAME], [EMAIL_1], [PHONE_1], [URL_1], [ADDRESS_1].
          - Preserve placeholders exactly as provided and never infer or generate real personal details.
          - Never output contact information unless it is already represented by placeholders in the input.

          Format the response as a valid JSON object with these exact field names. Ensure all fields are strings or arrays of strings.
          For the highlights, include specific metrics, numbers, and outcomes where possible.
          If a field is not found, use an empty string or empty array as appropriate.`;
}

export function buildHighlightPrompt(context = '', strictPrivacy = false) {
  let systemPrompt =
    "You are a professional resume analyzer. Extract and generate 5-7 key highlights from the resume text provided. Each highlight should be exactly ONE paragraph with no more than 4 sentences, focusing on quantifiable achievements, specific technologies used, and business impact. Include metrics, numbers, and outcomes where possible. Format each highlight as a concise, impactful paragraph that demonstrates the candidate's expertise and results. Keep each highlight focused and to the point.";

  if (context && context.trim()) {
    systemPrompt += `\n\nIMPORTANT CONTEXT: The user wants highlights that specifically focus on: ${context.trim()}. Please prioritize and emphasize experiences, skills, and achievements related to this context. If the resume contains relevant information about this context, make sure to highlight it prominently. If the resume doesn't contain much information about this context, still generate relevant highlights but note that the resume may not have extensive experience in this area.`;
  }

  systemPrompt += `\n\nPRIVACY REQUIREMENTS:
  - The input may include placeholders such as [CANDIDATE_NAME], [EMAIL_1], [PHONE_1], [URL_1], [ADDRESS_1], [ORG_1].
  - Keep placeholders as-is and do not infer or generate real identifiers.
  - Do not include direct contact details or addresses in highlights.`;

  if (strictPrivacy) {
    systemPrompt += '\n- STRICT MODE: Never include contact details, profile links, or specific addresses. Focus only on experience, impact, and skills.';
  }

  systemPrompt +=
    '\n\nFORMAT REQUIREMENTS: Each highlight must be exactly one paragraph with a maximum of 4 sentences. Do not use bullet points or numbered lists. Each highlight should be a standalone paragraph.';

  return systemPrompt;
}
