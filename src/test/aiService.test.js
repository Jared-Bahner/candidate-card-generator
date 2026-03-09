import { beforeEach, describe, expect, it, vi } from 'vitest';
import { extractTextFromPDF, generateHighlightsFromResume } from '../services/aiService';

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: vi.fn()
}));

describe('AI Service', () => {
  let mockPdfJs;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockPdfJs = await import('pdfjs-dist');
    global.fetch = vi.fn();
  });

  describe('extractTextFromPDF', () => {
    it('extracts text and calls backend parser endpoint', async () => {
      const mockPdfDoc = {
        numPages: 2,
        getPage: vi.fn()
      };

      mockPdfDoc.getPage.mockImplementation((pageNum) =>
        Promise.resolve({
          getTextContent: vi.fn().mockResolvedValue({
            items:
              pageNum === 1
                ? [{ str: 'John Doe' }, { str: 'john@example.com' }]
                : [{ str: 'Software Engineer' }, { str: 'React' }]
          })
        })
      );

      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.resolve(mockPdfDoc)
      });

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            name: '[CANDIDATE_NAME]',
            position: 'Software Engineer',
            email: '[EMAIL_1]',
            phone: '',
            address: '',
            linkedin: '',
            resumeLink: '',
            coreSkills: ['React', 'Node.js', 'JavaScript'],
            highlights: ['Built features with measurable impact.']
          }
        })
      });

      const result = await extractTextFromPDF(new ArrayBuffer(8));

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/parse-resume',
        expect.objectContaining({
          method: 'POST'
        })
      );

      const requestBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      expect(requestBody.sanitizedText).toContain('[EMAIL_1]');
      expect(requestBody.sanitizedText).not.toContain('john@example.com');
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.fullText).toContain('John Doe');
    });

    it('surfaces parser endpoint errors', async () => {
      mockPdfJs.getDocument.mockReturnValue({
        promise: Promise.resolve({
          numPages: 1,
          getPage: vi.fn().mockResolvedValue({
            getTextContent: vi.fn().mockResolvedValue({ items: [{ str: 'Test' }] })
          })
        })
      });

      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'API rate limit exceeded' })
      });

      await expect(extractTextFromPDF(new ArrayBuffer(8))).rejects.toThrow(
        'Failed to process PDF: API rate limit exceeded'
      );
    });
  });

  describe('generateHighlightsFromResume', () => {
    it('calls backend highlights endpoint and parses response paragraphs', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            highlightsText: `Led development of React-based applications.

Implemented CI/CD pipeline.

Mentored junior developers.`
          }
        })
      });

      const result = await generateHighlightsFromResume('Software engineer profile', 'React');

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/generate-highlights',
        expect.objectContaining({
          method: 'POST'
        })
      );
      expect(result).toHaveLength(3);
      expect(result[0]).toContain('React-based');
    });

    it('retries in strict privacy mode when PII appears', async () => {
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { highlightsText: 'Contact: jane@example.com' }
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: { highlightsText: 'Improved performance by 42% across dashboards.' }
          })
        });

      const result = await generateHighlightsFromResume(
        'Reach me at jane@example.com for details.',
        'frontend'
      );

      expect(global.fetch).toHaveBeenCalledTimes(2);
      const firstBody = JSON.parse(global.fetch.mock.calls[0][1].body);
      const secondBody = JSON.parse(global.fetch.mock.calls[1][1].body);
      expect(firstBody.strictPrivacy).toBe(false);
      expect(secondBody.strictPrivacy).toBe(true);
      expect(firstBody.sanitizedText).toContain('[EMAIL_1]');
      expect(firstBody.sanitizedText).not.toContain('jane@example.com');
      expect(result[0]).toContain('42%');
    });

    it('handles deprecated model messaging from backend', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'Our AI service is being upgraded. Please try again in a few minutes.'
        })
      });

      await expect(generateHighlightsFromResume('resume text')).rejects.toThrow(
        'Our AI service is being upgraded. Please try again in a few minutes.'
      );
    });
  });
});