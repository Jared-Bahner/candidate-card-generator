/**
 * Ensures a URL starts with https://
 * @param {string} url - The URL to process
 * @returns {string} The URL with https:// prefix
 */
export const ensureHttps = (url) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `https://${url}`;
}; 