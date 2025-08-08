import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProfileForm from '../components/ProfileForm';

// Mock the AI service
vi.mock('../services/aiService', () => ({
  extractTextFromPDF: vi.fn(),
  generateHighlightsFromResume: vi.fn()
}));

// Mock the common utils
vi.mock('../utils/common', () => ({
  ensureHttps: vi.fn((url) => url)
}));

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  default: {
    GlobalWorkerOptions: {
      workerSrc: ''
    },
    getDocument: vi.fn()
  }
}));

describe('ProfileForm Component', () => {
  const mockFormData = {
    name: '',
    position: '',
    email: '',
    phone: '',
    address: '',
    linkedin: '',
    resumeLink: '',
    portfolioLink: '',
    highlights: [''],
    coreSkills: ['', '', ''],
    placementType: 'Contractor',
    profileImage: ''
  };

  const mockHandlers = {
    onInputChange: vi.fn(),
    onHighlightChange: vi.fn(),
    onAddHighlight: vi.fn(),
    onRemoveHighlight: vi.fn(),
    onImageUpload: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form with all fields', () => {
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    expect(screen.getByTestId('name-input')).toBeInTheDocument();
    expect(screen.getByTestId('position-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
    expect(screen.getByTestId('resume-upload')).toBeInTheDocument();
    expect(screen.getByTestId('image-upload')).toBeInTheDocument();
  });

  it('handles input changes', async () => {
    const user = userEvent.setup();
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const nameInput = screen.getByTestId('name-input');
    await user.type(nameInput, 'John Doe');

    expect(mockHandlers.onInputChange).toHaveBeenCalledWith('name', 'John Doe');
  });

  it('handles placement type changes', async () => {
    const user = userEvent.setup();
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const directPlacementButton = screen.getByText('Direct Placement');
    await user.click(directPlacementButton);

    expect(mockHandlers.onInputChange).toHaveBeenCalledWith('placementType', 'Direct Placement');
  });

  it('handles core skill changes', async () => {
    const user = userEvent.setup();
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const skillInputs = screen.getAllByPlaceholderText(/Core Skill/);
    await user.type(skillInputs[0], 'React');

    expect(mockHandlers.onInputChange).toHaveBeenCalledWith('coreSkills', ['React', '', '']);
  });

  it('handles highlight changes', async () => {
    const user = userEvent.setup();
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const highlightTextarea = screen.getByPlaceholderText('Enter a key highlight');
    await user.type(highlightTextarea, 'New highlight');

    expect(mockHandlers.onHighlightChange).toHaveBeenCalledWith(0, 'New highlight');
  });

  it('adds new highlights', async () => {
    const user = userEvent.setup();
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const addButton = screen.getByTestId('add-highlight');
    await user.click(addButton);

    expect(mockHandlers.onAddHighlight).toHaveBeenCalled();
  });

  it('handles resume upload successfully', async () => {
    const user = userEvent.setup();
    const { extractTextFromPDF } = await import('../services/aiService');
    
    extractTextFromPDF.mockResolvedValue({
      name: 'John Doe',
      position: 'Developer',
      email: 'john@example.com',
      phone: '123-456-7890',
      address: '123 Main St',
      linkedin: 'linkedin.com/in/johndoe',
      resumeLink: 'example.com/resume.pdf',
      portfolioLink: 'johndoe.dev',
      coreSkills: ['React', 'Node.js'],
      highlights: ['Led development team'],
      fullText: 'Resume text content'
    });

    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const resumeUpload = screen.getByTestId('resume-upload');
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    await user.upload(resumeUpload, file);

    await waitFor(() => {
      expect(extractTextFromPDF).toHaveBeenCalled();
    });

    expect(mockHandlers.onInputChange).toHaveBeenCalledWith('name', 'John Doe');
    expect(mockHandlers.onInputChange).toHaveBeenCalledWith('position', 'Developer');
    expect(mockHandlers.onInputChange).toHaveBeenCalledWith('email', 'john@example.com');
  });

  it('handles resume upload errors', async () => {
    const user = userEvent.setup();
    const { extractTextFromPDF } = await import('../services/aiService');
    
    extractTextFromPDF.mockRejectedValue(new Error('PDF processing failed'));

    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const resumeUpload = screen.getByTestId('resume-upload');
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    await user.upload(resumeUpload, file);

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
    });

    expect(screen.getByText(/Failed to process resume/)).toBeInTheDocument();
  });

  it('rejects non-PDF files', async () => {
    const user = userEvent.setup();
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const resumeUpload = screen.getByTestId('resume-upload');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    await user.upload(resumeUpload, file);

    await waitFor(() => {
      expect(screen.getByTestId('upload-error')).toBeInTheDocument();
    });

    expect(screen.getByText('Please upload a PDF file')).toBeInTheDocument();
  });

  it('shows quick examples for context input', () => {
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('React development')).toBeInTheDocument();
    expect(screen.getByText('Next.js projects')).toBeInTheDocument();
    expect(screen.getByText('AWS cloud')).toBeInTheDocument();
    expect(screen.getByText('Leadership')).toBeInTheDocument();
  });

  it('sets context when quick example is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const reactExample = screen.getByText('React development');
    await user.click(reactExample);

    const contextInput = screen.getByTestId('context-input');
    expect(contextInput).toHaveValue('React development');
  });

  it('shows processing state during resume upload', async () => {
    const user = userEvent.setup();
    const { extractTextFromPDF } = await import('../services/aiService');
    
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    const processingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    extractTextFromPDF.mockReturnValue(processingPromise);

    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const resumeUpload = screen.getByTestId('resume-upload');
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    await user.upload(resumeUpload, file);

    await waitFor(() => {
      expect(screen.getByTestId('processing-status')).toBeInTheDocument();
    });

    // Resolve the promise
    resolvePromise({
      name: 'John Doe',
      position: 'Developer',
      fullText: 'Resume text'
    });
  });

  it('generates context-based highlights', async () => {
    const user = userEvent.setup();
    const { generateHighlightsFromResume } = await import('../services/aiService');
    
    generateHighlightsFromResume.mockResolvedValue([
      'Suggested highlight 1',
      'Suggested highlight 2'
    ]);

    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const contextInput = screen.getByTestId('context-input');
    const generateButton = screen.getByTestId('generate-button');

    await user.type(contextInput, 'React development');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('suggested-highlights')).toBeInTheDocument();
    });
    
    expect(screen.getByText('Suggested highlight 1')).toBeInTheDocument();
    expect(screen.getByText('Suggested highlight 2')).toBeInTheDocument();
  });

  it('adds suggested highlights when clicked', async () => {
    const user = userEvent.setup();
    const { generateHighlightsFromResume } = await import('../services/aiService');
    
    generateHighlightsFromResume.mockResolvedValue([
      'Suggested highlight 1'
    ]);

    render(
      <ProfileForm
        formData={mockFormData}
        {...mockHandlers}
      />
    );

    const contextInput = screen.getByTestId('context-input');
    const generateButton = screen.getByTestId('generate-button');

    await user.type(contextInput, 'React development');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByTestId('suggested-highlights')).toBeInTheDocument();
    });
    
    const addButton = screen.getByText('Add');
    await user.click(addButton);

    expect(mockHandlers.onAddHighlight).toHaveBeenCalled();
    expect(mockHandlers.onHighlightChange).toHaveBeenCalledWith(1, 'Suggested highlight 1');
  });
}); 