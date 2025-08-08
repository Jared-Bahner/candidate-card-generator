const STORAGE_KEY = 'candidate-card-creator-recent-cards';
const MAX_RECENT_CARDS = 5;

/**
 * Save a card to recent cards in local storage
 * @param {Object} cardData - The form data to save
 */
export const saveRecentCard = (cardData) => {
  try {
    // Get existing recent cards
    const existingCards = getRecentCards();
    
    // Create new card entry
    const newCard = {
      id: Date.now().toString(),
      data: { ...cardData },
      timestamp: Date.now()
    };
    
    // Add new card to the beginning and limit to MAX_RECENT_CARDS
    const updatedCards = [newCard, ...existingCards].slice(0, MAX_RECENT_CARDS);
    
    // Save to local storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
  } catch (error) {
    console.error('Error saving recent card:', error);
  }
};

/**
 * Get recent cards from local storage
 * @returns {Array} Array of recent cards
 */
export const getRecentCards = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading recent cards:', error);
    return [];
  }
};

/**
 * Clear all recent cards from local storage
 */
export const clearRecentCards = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recent cards:', error);
  }
};

/**
 * Remove a specific card from recent cards
 * @param {string} cardId - The ID of the card to remove
 */
export const removeRecentCard = (cardId) => {
  try {
    const existingCards = getRecentCards();
    const updatedCards = existingCards.filter(card => card.id !== cardId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCards));
  } catch (error) {
    console.error('Error removing recent card:', error);
  }
}; 