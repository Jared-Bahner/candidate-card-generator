import OpenAI from 'openai';
import * as pdfjsLib from 'pdfjs-dist';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';

const ASSISTANT_ID = 'asst_zPHDvmWmDRHOJlU9D7rl4SNo';

export async function extractTextFromPDF(pdfBuffer) {
  try {
    // Convert ArrayBuffer to Uint8Array for PDF.js
    const pdfData = new Uint8Array(pdfBuffer);
    
    // Load the PDF document
    const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
    
    // Extract text from each page
    let fullText = '';
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      const page = await pdfDoc.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    // Use OpenAI to analyze the text and extract structured information
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a professional resume parser. Extract the following information from the resume in a structured JSON format:
          - name (full name)
          - position (current or most recent job title)
          - email
          - phone
          - address (full address if available)
          - linkedin (LinkedIn URL if found)
          - resumeLink (any other portfolio or resume links)
          - coreSkills (array of 3 most important technical skills)
          - highlights (array of 5-7 detailed achievements/experiences, each 2-3 sentences long, focusing on quantifiable results and impact)
          
          Format the response as a valid JSON object with these exact field names. Ensure all fields are strings or arrays of strings.
          For the highlights, include specific metrics, numbers, and outcomes where possible.
          If a field is not found, use an empty string or empty array as appropriate.`
        },
        {
          role: "user",
          content: fullText
        }
      ],
      temperature: 0,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const parsedData = JSON.parse(response.choices[0].message.content);
    
    // Return both the parsed data and the full text
    return {
      ...parsedData,
      fullText: fullText
    };
  } catch (error) {
    console.error('Error processing PDF:', error);
    if (error.message && error.message.includes('has been deprecated')) {
      throw new Error('Our AI service is being upgraded. Please try again in a few minutes.');
    }
    throw new Error('Failed to process PDF: ' + error.message);
  }
}

// Helper function to convert ArrayBuffer to base64 (currently unused)
// function arrayBufferToBase64(buffer) {
//   let binary = '';
//   const bytes = new Uint8Array(buffer);
//   const len = bytes.byteLength;
//   for (let i = 0; i < len; i++) {
//     binary += String.fromCharCode(bytes[i]);
//   }
//   return btoa(binary);
// }

export async function generateHighlightsFromResume(resumeText, context = '') {
  try {
    let systemPrompt = "You are a professional resume analyzer. Extract and generate 5-7 key highlights from the resume text provided. Each highlight should be exactly ONE paragraph with no more than 4 sentences, focusing on quantifiable achievements, specific technologies used, and business impact. Include metrics, numbers, and outcomes where possible. Format each highlight as a concise, impactful paragraph that demonstrates the candidate's expertise and results. Keep each highlight focused and to the point.";
    
    // Add context-specific instructions if provided
    if (context && context.trim()) {
      systemPrompt += `\n\nIMPORTANT CONTEXT: The user wants highlights that specifically focus on: ${context.trim()}. Please prioritize and emphasize experiences, skills, and achievements related to this context. If the resume contains relevant information about this context, make sure to highlight it prominently. If the resume doesn't contain much information about this context, still generate relevant highlights but note that the resume may not have extensive experience in this area.`;
    }

    systemPrompt += `\n\nFORMAT REQUIREMENTS: Each highlight must be exactly one paragraph with a maximum of 4 sentences. Do not use bullet points or numbered lists. Each highlight should be a standalone paragraph.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: resumeText
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Extract highlights from the response
    const highlightsText = response.choices[0].message.content;
    // Split the response into individual highlights and clean them up
    const highlights = highlightsText
      .split('\n\n') // Split by double newlines to get paragraphs
      .filter(paragraph => paragraph.trim())
      .map(paragraph => paragraph.trim().replace(/^[•\-*\d]+\.?\s*/, '')); // Remove bullet points, numbers, and extra whitespace

    return highlights;
  } catch (error) {
    console.error('Error generating highlights:', error);
    if (error.message && error.message.includes('has been deprecated')) {
      throw new Error('Our AI service is being upgraded. Please try again in a few minutes.');
    }
    throw new Error('Failed to generate highlights from resume');
  }
} 