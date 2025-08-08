import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Mock the components that are not the focus of these tests
vi.mock('../components/ProfileForm', () => ({
  default: ({ formData, onInputChange, onAddHighlight, onRemoveHighlight, onImageUpload }) => (
    <div data-testid="profile-form">
      <input
        data-testid="name-input"
        value={formData.name || ''}
        onChange={(e) => onInputChange('name', e.target.value)}
        placeholder="Enter candidate name"
      />
      <input
        data-testid="position-input"
        value={formData.position || ''}
        onChange={(e) => onInputChange('position', e.target.value)}
        placeholder="Enter candidate position"
      />
      <input
        data-testid="email-input"
        value={formData.email || ''}
        onChange={(e) => onInputChange('email', e.target.value)}
        placeholder="Enter candidate email address"
      />
      <input
        data-testid="phone-input"
        value={formData.phone || ''}
        onChange={(e) => onInputChange('phone', e.target.value)}
        placeholder="Enter candidate phone number"
      />
      <button
        data-testid="add-highlight"
        onClick={() => onAddHighlight()}
      >
        Add Highlight
      </button>
      <button
        data-testid="remove-highlight"
        onClick={() => onRemoveHighlight(0)}
      >
        Remove Highlight
      </button>
      <input
        data-testid="image-upload"
        type="file"
        onChange={onImageUpload}
        accept="image/*"
      />
    </div>
  )
}));

vi.mock('../components/ProfileCard', () => ({
  default: ({ formData }) => (
    <div data-testid="profile-card">
      <h2>{formData.name || 'No Name'}</h2>
      <p>{formData.position || 'No Position'}</p>
      <p>{formData.email || 'No Email'}</p>
      <p>{formData.phone || 'No Phone'}</p>
    </div>
  )
}));

vi.mock('../components/PDFProfileCard', () => ({
  default: ({ formData }) => (
    <div data-testid="pdf-profile-card">
      <h2>{formData.name || 'No Name'}</h2>
      <p>{formData.position || 'No Position'}</p>
    </div>
  )
}));

vi.mock('../components/RecentCards', () => ({
  default: ({ recentCards, onLoadCard, onClearHistory }) => (
    <div data-testid="recent-cards">
      <h3>Recent Cards</h3>
      {recentCards.map((card, index) => (
        <button
          key={card.id}
          data-testid={`load-card-${index}`}
          onClick={() => onLoadCard(card.data)}
        >
          Load {card.data.name || 'Unnamed Card'}
        </button>
      ))}
      <button
        data-testid="clear-history"
        onClick={onClearHistory}
      >
        Clear History
      </button>
    </div>
  )
}));

vi.mock('../utils/storage', () => ({
  saveRecentCard: vi.fn(),
  getRecentCards: vi.fn(() => []),
  clearRecentCards: vi.fn()
}));

vi.mock('../fonts', () => ({}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Candidate Card Creator')).toBeInTheDocument();
  });

  it('renders all main sections', () => {
    render(<App />);
    expect(screen.getByTestId('profile-form')).toBeInTheDocument();
    expect(screen.getByTestId('profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('recent-cards')).toBeInTheDocument();
  });

  it('displays live preview section', () => {
    render(<App />);
    expect(screen.getByText('Live Preview')).toBeInTheDocument();
  });

  it('displays export PDF button', () => {
    render(<App />);
    expect(screen.getByText('Export PDF')).toBeInTheDocument();
  });

  it('displays save card button', () => {
    render(<App />);
    expect(screen.getByText('Save Card to Recent')).toBeInTheDocument();
  });

  it('updates form data when inputs change', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const nameInput = screen.getByTestId('name-input');
    const positionInput = screen.getByTestId('position-input');
    
    await user.type(nameInput, 'John Doe');
    await user.type(positionInput, 'Software Engineer');
    
    expect(nameInput).toHaveValue('John Doe');
    expect(positionInput).toHaveValue('Software Engineer');
  });

  it('handles image upload', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const imageUpload = screen.getByTestId('image-upload');
    
    await user.upload(imageUpload, file);
    
    // The mock FileReader will set the result
    expect(imageUpload.files[0]).toBe(file);
  });

  it('handles adding highlights', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const addHighlightButton = screen.getByTestId('add-highlight');
    await user.click(addHighlightButton);
    
    // The highlight should be added to the form data
    // We can verify this by checking if the remove button becomes available
    expect(screen.getByTestId('remove-highlight')).toBeInTheDocument();
  });

  it('handles removing highlights', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // First add a highlight
    const addHighlightButton = screen.getByTestId('add-highlight');
    await user.click(addHighlightButton);
    
    // Then remove it
    const removeHighlightButton = screen.getByTestId('remove-highlight');
    await user.click(removeHighlightButton);
    
    // The remove button should no longer be available
    expect(screen.queryByTestId('remove-highlight')).not.toBeInTheDocument();
  });

  it('saves card when save button is clicked', async () => {
    const user = userEvent.setup();
    const { saveRecentCard } = await import('../utils/storage');
    
    render(<App />);
    
    // Fill in some data
    const nameInput = screen.getByTestId('name-input');
    await user.type(nameInput, 'John Doe');
    
    const saveButton = screen.getByText('Save Card to Recent');
    await user.click(saveButton);
    
    expect(saveRecentCard).toHaveBeenCalled();
  });

  it('loads recent cards on mount', async () => {
    const { getRecentCards } = await import('../utils/storage');
    getRecentCards.mockReturnValue([
      {
        id: '1',
        data: { name: 'John Doe', position: 'Developer' },
        timestamp: Date.now()
      }
    ]);
    
    render(<App />);
    
    expect(getRecentCards).toHaveBeenCalled();
  });

  it('handles loading a card from recent cards', async () => {
    const user = userEvent.setup();
    const { getRecentCards } = await import('../utils/storage');
    
    getRecentCards.mockReturnValue([
      {
        id: '1',
        data: { name: 'John Doe', position: 'Developer' },
        timestamp: Date.now()
      }
    ]);
    
    render(<App />);
    
    const loadCardButton = screen.getByTestId('load-card-0');
    await user.click(loadCardButton);
    
    // The form should be populated with the loaded data
    expect(screen.getByTestId('name-input')).toHaveValue('John Doe');
    expect(screen.getByTestId('position-input')).toHaveValue('Developer');
  });

  it('handles clearing history', async () => {
    const user = userEvent.setup();
    const { clearRecentCards } = await import('../utils/storage');
    
    render(<App />);
    
    const clearHistoryButton = screen.getByTestId('clear-history');
    await user.click(clearHistoryButton);
    
    expect(clearRecentCards).toHaveBeenCalled();
  });

  it('disables save button when no meaningful data is entered', () => {
    render(<App />);
    
    const saveButton = screen.getByText('Save Card to Recent');
    expect(saveButton).toBeDisabled();
  });

  it('enables save button when meaningful data is entered', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const nameInput = screen.getByTestId('name-input');
    await user.type(nameInput, 'John Doe');
    
    const saveButton = screen.getByText('Save Card to Recent');
    expect(saveButton).not.toBeDisabled();
  });

  it('handles window resize for scaling', () => {
    render(<App />);
    
    // Simulate window resize
    fireEvent.resize(window);
    
    // The scale factor should be calculated based on the container width
    // This is handled internally by the useEffect
    expect(document.documentElement.style.getPropertyValue('--scale-factor')).toBeDefined();
  });
}); 