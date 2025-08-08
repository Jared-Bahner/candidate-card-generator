import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveRecentCard, getRecentCards, clearRecentCards, removeRecentCard } from '../utils/storage';

describe('Storage Utils', () => {
  let mockStorage = {};

  beforeEach(() => {
    // Reset mock storage
    mockStorage = {};
    vi.clearAllMocks();
    
    // Mock localStorage methods with proper implementation
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key) => {
          return mockStorage[key] || null;
        }),
        setItem: vi.fn((key, value) => {
          mockStorage[key] = value;
        }),
        removeItem: vi.fn((key) => {
          delete mockStorage[key];
        }),
        clear: vi.fn(() => {
          mockStorage = {};
        }),
        length: 0,
        key: vi.fn()
      },
      writable: true,
      configurable: true
    });
  });

  afterEach(() => {
    // Clean up
    mockStorage = {};
  });

  describe('saveRecentCard', () => {
    it('saves a card to localStorage', () => {
      const cardData = {
        name: 'John Doe',
        position: 'Software Engineer',
        email: 'john@example.com'
      };

      saveRecentCard(cardData);

      const stored = localStorage.getItem('candidate-card-creator-recent-cards');
      const parsed = JSON.parse(stored);
      
      expect(parsed).toHaveLength(1);
      expect(parsed[0].data).toEqual(cardData);
      expect(parsed[0].id).toBeDefined();
      expect(parsed[0].timestamp).toBeDefined();
    });

    it('adds new cards to the beginning of the list', () => {
      const card1 = { name: 'John Doe', position: 'Engineer' };
      const card2 = { name: 'Jane Smith', position: 'Developer' };

      saveRecentCard(card1);
      saveRecentCard(card2);

      const stored = localStorage.getItem('candidate-card-creator-recent-cards');
      const parsed = JSON.parse(stored);
      
      expect(parsed).toHaveLength(2);
      expect(parsed[0].data).toEqual(card2); // Most recent first
      expect(parsed[1].data).toEqual(card1);
    });

    it('limits the number of stored cards to 5', () => {
      const cards = [
        { name: 'Card 1', position: 'Position 1' },
        { name: 'Card 2', position: 'Position 2' },
        { name: 'Card 3', position: 'Position 3' },
        { name: 'Card 4', position: 'Position 4' },
        { name: 'Card 5', position: 'Position 5' },
        { name: 'Card 6', position: 'Position 6' }
      ];

      cards.forEach(card => saveRecentCard(card));

      const stored = localStorage.getItem('candidate-card-creator-recent-cards');
      const parsed = JSON.parse(stored);
      
      expect(parsed).toHaveLength(5);
      expect(parsed[0].data).toEqual(cards[5]); // Most recent
      expect(parsed[4].data).toEqual(cards[1]); // Oldest kept
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      const cardData = { name: 'John Doe' };
      
      // Should not throw an error
      expect(() => saveRecentCard(cardData)).not.toThrow();

      // Restore original function
      localStorage.setItem = originalSetItem;
    });
  });

  describe('getRecentCards', () => {
    it('returns empty array when no cards are stored', () => {
      const cards = getRecentCards();
      expect(cards).toEqual([]);
    });

    it('returns stored cards in correct order', () => {
      const card1 = { name: 'John Doe', position: 'Engineer' };
      const card2 = { name: 'Jane Smith', position: 'Developer' };

      saveRecentCard(card1);
      saveRecentCard(card2);

      const cards = getRecentCards();
      expect(cards).toHaveLength(2);
      expect(cards[0].data).toEqual(card2); // Most recent first
      expect(cards[1].data).toEqual(card1);
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalGetItem = localStorage.getItem;
      localStorage.getItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should return empty array instead of throwing
      const cards = getRecentCards();
      expect(cards).toEqual([]);

      // Restore original function
      localStorage.getItem = originalGetItem;
    });

    it('handles invalid JSON gracefully', () => {
      // Mock localStorage to return invalid JSON
      localStorage.getItem = vi.fn().mockReturnValue('invalid json');

      const cards = getRecentCards();
      expect(cards).toEqual([]);
    });
  });

  describe('clearRecentCards', () => {
    it('removes all stored cards', () => {
      const card1 = { name: 'John Doe', position: 'Engineer' };
      const card2 = { name: 'Jane Smith', position: 'Developer' };

      saveRecentCard(card1);
      saveRecentCard(card2);

      expect(getRecentCards()).toHaveLength(2);

      clearRecentCards();

      expect(getRecentCards()).toHaveLength(0);
      expect(localStorage.removeItem).toHaveBeenCalledWith('candidate-card-creator-recent-cards');
    });

    it('handles localStorage errors gracefully', () => {
      // Mock localStorage to throw an error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw an error
      expect(() => clearRecentCards()).not.toThrow();

      // Restore original function
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('removeRecentCard', () => {
    it('removes a specific card by ID', () => {
      const card1 = { name: 'John Doe', position: 'Engineer' };
      const card2 = { name: 'Jane Smith', position: 'Developer' };

      saveRecentCard(card1);
      saveRecentCard(card2);

      const cards = getRecentCards();
      expect(cards).toHaveLength(2);

      const cardToRemove = cards[0];
      removeRecentCard(cardToRemove.id);

      const remainingCards = getRecentCards();
      expect(remainingCards).toHaveLength(1);
      expect(remainingCards[0].id).not.toBe(cardToRemove.id);
    });

    it('does nothing if card ID is not found', () => {
      const card1 = { name: 'John Doe', position: 'Engineer' };
      saveRecentCard(card1);

      const cards = getRecentCards();
      expect(cards).toHaveLength(1);

      removeRecentCard('non-existent-id');

      const remainingCards = getRecentCards();
      expect(remainingCards).toHaveLength(1);
    });

    it('handles localStorage errors gracefully', () => {
      const card1 = { name: 'John Doe', position: 'Engineer' };
      saveRecentCard(card1);

      const cards = getRecentCards();
      const cardToRemove = cards[0];

      // Mock localStorage to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw an error
      expect(() => removeRecentCard(cardToRemove.id)).not.toThrow();

      // Restore original function
      localStorage.setItem = originalSetItem;
    });
  });

  describe('integration tests', () => {
    it('maintains correct order when adding and removing cards', () => {
      const cards = [
        { name: 'Card 1', position: 'Position 1' },
        { name: 'Card 2', position: 'Position 2' },
        { name: 'Card 3', position: 'Position 3' }
      ];

      // Add cards
      cards.forEach(card => saveRecentCard(card));

      let storedCards = getRecentCards();
      expect(storedCards).toHaveLength(3);
      expect(storedCards[0].data).toEqual(cards[2]); // Most recent
      expect(storedCards[2].data).toEqual(cards[0]); // Oldest

      // Remove middle card
      const cardToRemove = storedCards[1];
      removeRecentCard(cardToRemove.id);

      storedCards = getRecentCards();
      expect(storedCards).toHaveLength(2);
      expect(storedCards[0].data).toEqual(cards[2]); // Most recent
      expect(storedCards[1].data).toEqual(cards[0]); // Oldest
    });

    it('handles edge cases correctly', () => {
      // Test with empty storage
      expect(getRecentCards()).toEqual([]);
      expect(() => clearRecentCards()).not.toThrow();
      expect(() => removeRecentCard('any-id')).not.toThrow();

      // Test with single card
      const card = { name: 'Single Card', position: 'Position' };
      saveRecentCard(card);

      const cards = getRecentCards();
      expect(cards).toHaveLength(1);

      removeRecentCard(cards[0].id);
      expect(getRecentCards()).toEqual([]);
    });
  });
}); 