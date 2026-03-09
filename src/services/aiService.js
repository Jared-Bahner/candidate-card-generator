import * as pdfjsLib from 'pdfjs-dist';
import {
  sanitizeTextForLLM,
  rehydrateFromPlaceholders,
  containsPotentialPII,
  redactPotentialPII
} from '../utils/privacySanitizer';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function postToServer(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  let responseBody = null;
  try {
    responseBody = await response.json();
  } catch {
    responseBody = null;
  }

  if (!response.ok) {
    throw new Error(responseBody?.error || `Request failed with status ${response.status}`);
  }

  return responseBody;
}

function parseHighlights(highlightsText) {
  return highlightsText
    .split('\n\n')
    .filter((paragraph) => paragraph.trim())
    .map((paragraph) => paragraph.trim().replace(/^[•\-*\d]+\.?\s*/, ''));
}

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

    const { sanitizedText, placeholderMap } = sanitizeTextForLLM(fullText);

    const response = await postToServer('/api/parse-resume', { sanitizedText });
    const parsedData = response?.data || {};
    const rehydratedData = rehydrateFromPlaceholders(parsedData, placeholderMap);
    
    // Return both the parsed data and the full text
    return {
      ...rehydratedData,
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
    const { sanitizedText, placeholderMap } = sanitizeTextForLLM(resumeText);
    let response = await postToServer('/api/generate-highlights', {
      sanitizedText,
      context,
      strictPrivacy: false
    });

    let highlightsText = response?.data?.highlightsText || '';

    if (containsPotentialPII(highlightsText)) {
      response = await postToServer('/api/generate-highlights', {
        sanitizedText,
        context,
        strictPrivacy: true
      });
      highlightsText = response?.data?.highlightsText || '';
    }

    if (containsPotentialPII(highlightsText)) {
      highlightsText = redactPotentialPII(highlightsText);
    }

    const rehydratedHighlights = rehydrateFromPlaceholders(highlightsText, placeholderMap);
    const highlights = parseHighlights(rehydratedHighlights);

    return highlights;
  } catch (error) {
    console.error('Error generating highlights:', error);
    if (
      error.message &&
      (error.message.includes('has been deprecated') ||
        error.message.includes('Our AI service is being upgraded'))
    ) {
      throw new Error('Our AI service is being upgraded. Please try again in a few minutes.');
    }
    throw new Error('Failed to generate highlights from resume');
  }
} 