// Add this utility file for cross-component messaging

/**
 * Set a global message that can be displayed in the header or other components
 * @param {string} type - Message type: 'success', 'error', 'warning', 'info'
 * @param {string} text - Message content
 */
export const setGlobalMessage = (type, text) => {
  localStorage.setItem('globalMessage', JSON.stringify({ type, text }));
  
  // Dispatch storage event to notify other components
  window.dispatchEvent(new Event('storage'));
};

/**
 * Clear any global messages
 */
export const clearGlobalMessage = () => {
  localStorage.removeItem('globalMessage');
};