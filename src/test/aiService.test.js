import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTextFromPDF, generateHighlightsFromResume } from '../services/aiService';

// Mock OpenAI
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn()
      }
    }
  }))
}));

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: vi.fn()
}));

describe('AI Service', () => {
  let mockOpenAI;
  let mockPdfJs;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get the mocked modules
    mockOpenAI = (await import('openai')).default;
    mockPdfJs = await import('pdfjs-dist');
    
    // Reset the mock implementation
    mockOpenAI.mockClear();
  });

  describe('extractTextFromPDF', () => {
    it('extracts text and parses data from PDF', async () => {
      const mockPdfDoc = {
        numPages: 2,
        getPage: vi.fn()
      };

      const mockPage1 = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'John Doe' }, { str: 'Software Engineer' }, { str: 'john@example.com' }]
        })
      };

      const mockPage2 = {
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Experience' }, { str: 'React' }, { str: 'Node.js' }]
        })
      };

      mockPdfDoc.getPage.mockImplementation((pageNum) => {
        return pageNum === 1 ? mockPage1 : mockPage2;
      });

      mockPdfJs.getDocument.mockResolvedValue(mockPdfDoc);

      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: JSON.stringify({
                    name: 'John Doe',
                    position: 'Software Engineer',
                    email: 'john@example.com',
                    phone: '123-456-7890',
                    address: '123 Main St',
                    linkedin: 'https://linkedin.com/in/johndoe',
                    resumeLink: 'https://example.com/resume.pdf',
                    coreSkills: ['React', 'Node.js', 'JavaScript'],
                    highlights: [
                      'Led development of React applications',
                      'Implemented CI/CD pipelines',
                      'Mentored junior developers'
                    ]
                  })
                }
              }]
            })
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const pdfBuffer = new ArrayBuffer(8);
      const result = await extractTextFromPDF(pdfBuffer);

      expect(mockPdfJs.getDocument).toHaveBeenCalledWith({ data: new Uint8Array(pdfBuffer) });
      expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
      expect(mockPdfDoc.getPage).toHaveBeenCalledWith(2);
      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalled();

      expect(result).toHaveProperty('name', 'John Doe');
      expect(result).toHaveProperty('position', 'Software Engineer');
      expect(result).toHaveProperty('email', 'john@example.com');
      expect(result).toHaveProperty('fullText');
      expect(result.fullText).toContain('John Doe');
      expect(result.fullText).toContain('Software Engineer');
    });

    it('handles PDF processing errors', async () => {
      mockPdfJs.getDocument.mockRejectedValue(new Error('PDF processing failed'));

      const pdfBuffer = new ArrayBuffer(8);

      await expect(extractTextFromPDF(pdfBuffer)).rejects.toThrow('Failed to process PDF: PDF processing failed');
    });

    it('handles OpenAI API errors', async () => {
      const mockPdfDoc = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [{ str: 'Test content' }]
          })
        })
      };

      mockPdfJs.getDocument.mockResolvedValue(mockPdfDoc);

      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('API rate limit exceeded'))
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const pdfBuffer = new ArrayBuffer(8);

      await expect(extractTextFromPDF(pdfBuffer)).rejects.toThrow('Failed to process PDF: API rate limit exceeded');
    });

    it('handles deprecated API errors', async () => {
      const mockPdfDoc = {
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [{ str: 'Test content' }]
          })
        })
      };

      mockPdfJs.getDocument.mockResolvedValue(mockPdfDoc);

      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('The model gpt-4 has been deprecated'))
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const pdfBuffer = new ArrayBuffer(8);

      await expect(extractTextFromPDF(pdfBuffer)).rejects.toThrow('Our AI service is being upgraded. Please try again in a few minutes.');
    });
  });

  describe('generateHighlightsFromResume', () => {
    it('generates highlights from resume text', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: `Led development of React-based web applications serving 10,000+ users, implementing modern UI/UX patterns and ensuring responsive design across all devices.

Implemented CI/CD pipeline using GitHub Actions and Docker, reducing deployment time by 60% and improving code quality through automated testing.

Mentored 5 junior developers and conducted code reviews, resulting in improved code quality and faster onboarding of new team members.`
                }
              }]
            })
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const resumeText = 'John Doe is a software engineer with 5 years of experience...';
      const context = 'React development';

      const result = await generateHighlightsFromResume(resumeText, context);

      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: expect.stringContaining('React development')
          },
          {
            role: "user",
            content: resumeText
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      expect(result).toHaveLength(3);
      expect(result[0]).toContain('React-based web applications');
      expect(result[1]).toContain('CI/CD pipeline');
      expect(result[2]).toContain('Mentored 5 junior developers');
    });

    it('generates highlights without context', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: `Developed full-stack web applications using modern technologies.

Led team of developers in agile environment.

Implemented database optimization strategies.`
                }
              }]
            })
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const resumeText = 'Software engineer with experience...';

      const result = await generateHighlightsFromResume(resumeText);

      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: expect.not.stringContaining('IMPORTANT CONTEXT')
          },
          {
            role: "user",
            content: resumeText
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      expect(result).toHaveLength(3);
    });

    it('handles empty or whitespace-only context', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: `General highlight 1.

General highlight 2.`
                }
              }]
            })
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const resumeText = 'Software engineer...';

      const result = await generateHighlightsFromResume(resumeText, '   ');

      expect(mockOpenAIInstance.chat.completions.create).toHaveBeenCalledWith({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: expect.not.stringContaining('IMPORTANT CONTEXT')
          },
          {
            role: "user",
            content: resumeText
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      });

      expect(result).toHaveLength(2);
    });

    it('cleans up bullet points and numbers from highlights', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: `• Led development of React applications

1. Implemented CI/CD pipeline

- Mentored junior developers

* Conducted code reviews`
                }
              }]
            })
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const resumeText = 'Software engineer...';

      const result = await generateHighlightsFromResume(resumeText);

      expect(result[0]).toBe('Led development of React applications');
      expect(result[1]).toBe('Implemented CI/CD pipeline');
      expect(result[2]).toBe('Mentored junior developers');
      expect(result[3]).toBe('Conducted code reviews');
    });

    it('handles OpenAI API errors', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('API error'))
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const resumeText = 'Software engineer...';

      await expect(generateHighlightsFromResume(resumeText)).rejects.toThrow('Failed to generate highlights from resume');
    });

    it('handles deprecated API errors', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockRejectedValue(new Error('The model gpt-4 has been deprecated'))
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const resumeText = 'Software engineer...';

      await expect(generateHighlightsFromResume(resumeText)).rejects.toThrow('Our AI service is being upgraded. Please try again in a few minutes.');
    });

    it('filters out empty highlights', async () => {
      const mockOpenAIInstance = {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [{
                message: {
                  content: `Valid highlight 1.



Valid highlight 2.

   `
                }
              }]
            })
          }
        }
      };

      mockOpenAI.mockImplementation(() => mockOpenAIInstance);

      const resumeText = 'Software engineer...';

      const result = await generateHighlightsFromResume(resumeText);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('Valid highlight 1.');
      expect(result[1]).toBe('Valid highlight 2.');
    });
  });
}); 