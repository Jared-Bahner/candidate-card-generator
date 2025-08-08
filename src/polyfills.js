// Polyfills for Node.js modules in browser environment
import { Buffer } from 'buffer';
import process from 'process';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.process = process;
  
  // Additional polyfills that might be needed
  if (!window.global) {
    window.global = window;
  }
  
  // Polyfill for crypto if needed
  if (!window.crypto) {
    window.crypto = {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 256);
        }
        return arr;
      }
    };
  }
}

// Export for use in other files
export { Buffer, process }; 