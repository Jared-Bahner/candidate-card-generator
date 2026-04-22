import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the AI service
vi.mock('../services/aiService', () => ({
  extractTextFromPDF: vi.fn(),
  generateHighlightsFromResume: vi.fn(),
  NO_TEXT_LAYER_ERROR: 'NO_TEXT_LAYER_ERROR'
}));

// Mock pdfjs-dist
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: vi.fn()
}));

// Mock the storage functions
vi.mock('../utils/storage', () => ({
  saveRecentCard: vi.fn(),
  getRecentCards: vi.fn(() => []),
  clearRecentCards: vi.fn()
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a complete candidate card workflow', async () => {
    const user = userEvent.setup();
    const { saveRecentCard } = await import('../utils/storage');
    
    render(<App />);

    // 1. Fill out the form with candidate information
    const nameInput = screen.getByPlaceholderText('Enter candidate name');
    const positionInput = screen.getByPlaceholderText('Enter candidate position');
    const emailInput = screen.getByPlaceholderText('Enter candidate email address');
    const phoneInput = screen.getByPlaceholderText('Enter candidate phone number');
    const linkedinInput = screen.getByPlaceholderText('Enter LinkedIn URL');
    const resumeLinkInput = screen.getByPlaceholderText('Enter resume URL');
    const portfolioLinkInput = screen.getByPlaceholderText('Enter portfolio URL');
    const addressInput = screen.getByPlaceholderText('Enter candidate location');

    await user.type(nameInput, 'John Doe');
    await user.type(positionInput, 'Senior Software Engineer');
    await user.type(emailInput, 'john.doe@example.com');
    await user.type(phoneInput, '+1-555-123-4567');
    await user.type(linkedinInput, 'linkedin.com/in/johndoe');
    await user.type(resumeLinkInput, 'example.com/resume.pdf');
    await user.type(portfolioLinkInput, 'johndoe.dev');
    await user.type(addressInput, 'San Francisco, CA');

    // 2. Add core skills
    const skillInputs = screen.getAllByPlaceholderText(/Core Skill/);
    await user.type(skillInputs[0], 'React');
    await user.type(skillInputs[1], 'Node.js');
    await user.type(skillInputs[2], 'AWS');

    // 3. Add highlights
    const addHighlightButton = screen.getByText('Add Highlight');
    await user.click(addHighlightButton);

    const highlightTextarea = screen.getAllByPlaceholderText('Enter a key highlight')[1];
    await user.type(highlightTextarea, 'Led development of React-based web applications serving 10,000+ users');

    // 4. Change placement type
    const directPlacementButton = screen.getByText('Direct Placement');
    await user.click(directPlacementButton);

    // 5. Verify the live preview updates
    await waitFor(() => {
      expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Senior Software Engineer').length).toBeGreaterThan(0);
      expect(screen.getAllByText('john.doe@example.com').length).toBeGreaterThan(0);
      expect(screen.getAllByText('+1-555-123-4567').length).toBeGreaterThan(0);
    });

    // 6. Save the card
    const saveButton = screen.getByText('Save Card');
    expect(saveButton).not.toBeDisabled();
    await user.click(saveButton);

    expect(saveRecentCard).toHaveBeenCalledWith(expect.objectContaining({
      name: 'John Doe',
      position: 'Senior Software Engineer',
      email: 'john.doe@example.com',
      phone: '+1-555-123-4567',
      linkedin: 'linkedin.com/in/johndoe',
      resumeLink: 'example.com/resume.pdf',
      portfolioLink: 'johndoe.dev',
      address: 'San Francisco, CA',
      coreSkills: ['React', 'Node.js', 'AWS'],
      highlights: ['', 'Led development of React-based web applications serving 10,000+ users'],
      placementType: 'Direct Placement'
    }));
  });

  it('handles resume upload and AI processing', async () => {
    const user = userEvent.setup();
    const { extractTextFromPDF } = await import('../services/aiService');
    
    extractTextFromPDF.mockResolvedValue({
      name: 'Jane Smith',
      position: 'Full Stack Developer',
      email: 'jane.smith@example.com',
      phone: '+1-555-987-6543',
      address: 'New York, NY',
      linkedin: 'linkedin.com/in/janesmith',
      resumeLink: 'example.com/jane-resume.pdf',
      portfolioLink: 'janesmith.dev',
      coreSkills: ['React', 'Python', 'Docker'],
      highlights: [
        'Developed full-stack applications using React and Node.js',
        'Implemented CI/CD pipelines reducing deployment time by 50%',
        'Led team of 3 developers in agile environment'
      ],
      fullText: 'Jane Smith is a full stack developer...'
    });

    render(<App />);

    // Upload resume
    const resumeUpload = screen.getByLabelText(/Click to upload PDF resume/);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    await user.upload(resumeUpload, file);

    // Wait for form to be populated
    await waitFor(() => {
      expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Full Stack Developer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('jane.smith@example.com')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+1-555-987-6543')).toBeInTheDocument();
    });

    // Verify core skills were populated
    const skillInputs = screen.getAllByPlaceholderText(/Core Skill/);
    expect(skillInputs[0]).toHaveValue('React');
    expect(skillInputs[1]).toHaveValue('Python');
    expect(skillInputs[2]).toHaveValue('Docker');

    // Verify highlights were populated
    const highlightTextareas = screen.getAllByPlaceholderText('Enter a key highlight');
    expect(highlightTextareas[0]).toHaveValue('Developed full-stack applications using React and Node.js');
    expect(highlightTextareas[1]).toHaveValue('Implemented CI/CD pipelines reducing deployment time by 50%');
    expect(highlightTextareas[2]).toHaveValue('Led team of 3 developers in agile environment');
  });

  it('handles context-based highlight generation', async () => {
    const user = userEvent.setup();
    const { generateHighlightsFromResume, extractTextFromPDF } = await import('../services/aiService');
    
    generateHighlightsFromResume.mockResolvedValue([
      'Led React development team of 5 developers',
      'Implemented React hooks and context API',
      'Built responsive React components'
    ]);

    render(<App />);

    // First upload a resume to get the text
    const resumeUpload = screen.getByLabelText(/Click to upload PDF resume/);
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    await user.upload(resumeUpload, file);

    // Wait for resume processing
    await waitFor(() => {
      expect(extractTextFromPDF).toHaveBeenCalled();
    });

    // Set context and generate highlights
    const contextInput = screen.getByPlaceholderText(/e.g., React development/);
    const generateButton = screen.getByText('Generate');

    await user.type(contextInput, 'React development');
    await user.click(generateButton);

    // Wait for highlights to be generated
    await waitFor(() => {
      expect(screen.getByText('Suggested Highlights')).toBeInTheDocument();
      expect(screen.getByText('Led React development team of 5 developers')).toBeInTheDocument();
      expect(screen.getByText('Implemented React hooks and context API')).toBeInTheDocument();
      expect(screen.getByText('Built responsive React components')).toBeInTheDocument();
    });

    // Add a suggested highlight
    const addButtons = screen.getAllByText('Add');
    await user.click(addButtons[0]);

    // Verify the highlight was added to the form
    const highlightTextareas = screen.getAllByPlaceholderText('Enter a key highlight');
    expect(highlightTextareas[highlightTextareas.length - 1]).toHaveValue('Led React development team of 5 developers');
  });

  it('manages recent cards functionality', async () => {
    const user = userEvent.setup();
    const { clearRecentCards, getRecentCards } = await import('../utils/storage');
    
    // Mock recent cards
    getRecentCards.mockReturnValue([
      {
        id: '1',
        data: { name: 'John Doe', position: 'Engineer', highlights: [''], coreSkills: ['', '', ''] },
        timestamp: Date.now()
      },
      {
        id: '2',
        data: { name: 'Jane Smith', position: 'Developer', highlights: [''], coreSkills: ['', '', ''] },
        timestamp: Date.now() - 1000
      }
    ]);

    render(<App />);

    // Load a recent card
    const cardToLoad = screen.getByText('John Doe');
    await user.click(cardToLoad);

    // Verify form was populated
    await waitFor(() => {
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Engineer')).toBeInTheDocument();
    });

    // Clear history
    const clearHistoryButton = screen.getByText('Clear History');
    await user.click(clearHistoryButton);

    expect(clearRecentCards).toHaveBeenCalled();
  });

  it('handles image upload', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Upload profile image
    const imageUpload = screen.getByLabelText(/Click to upload profile image/);
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    await user.upload(imageUpload, file);

    expect(imageUpload.files[0]).toBe(file);
  });

  it('keeps save button enabled during normal form input', async () => {
    const user = userEvent.setup();
    render(<App />);

    const saveButton = screen.getByText('Save Card');
    expect(saveButton).not.toBeDisabled();

    // Fill in some data
    const nameInput = screen.getByPlaceholderText('Enter candidate name');
    await user.type(nameInput, 'John Doe');

    // Button should remain enabled
    expect(saveButton).not.toBeDisabled();

    // Clear the name
    await user.clear(nameInput);

    // Button should remain enabled even with empty input
    expect(saveButton).not.toBeDisabled();

    // Fill in position instead
    const positionInput = screen.getByPlaceholderText('Enter candidate position');
    await user.type(positionInput, 'Engineer');

    // Button should remain enabled
    expect(saveButton).not.toBeDisabled();
  });

  it('handles error states gracefully', async () => {
    const user = userEvent.setup();
    const { extractTextFromPDF } = await import('../services/aiService');
    
    extractTextFromPDF.mockRejectedValue(new Error('PDF processing failed'));

    render(<App />);

    // Upload invalid file
    const resumeUpload = screen.getByLabelText(/Click to upload PDF resume/);
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    fireEvent.change(resumeUpload, { target: { files: [file] } });

    // Should show error message
    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toHaveTextContent('Please upload a PDF file');
    });

    // Upload valid file that fails processing
    const pdfFile = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    fireEvent.change(resumeUpload, { target: { files: [pdfFile] } });

    // Should show processing error
    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toHaveTextContent('Failed to process resume: PDF processing failed');
    });
  });
}); 