import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
import.meta.env.VITE_OPENAI_API_KEY = 'test-api-key';

// Mock localStorage with actual storage simulation
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => {
    return localStorageMock.store[key] || null;
  }),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value;
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
Object.defineProperty(window, 'ResizeObserver', {
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
  writable: true
});

// Mock FileReader
Object.defineProperty(window, 'FileReader', {
  value: vi.fn().mockImplementation(() => ({
    readAsDataURL: vi.fn(),
    readAsText: vi.fn(),
    onload: null,
    result: 'data:image/jpeg;base64,test',
  })),
  writable: true
});

// Mock File with arrayBuffer method
Object.defineProperty(window, 'File', {
  value: class MockFile {
    constructor(bits, name, options) {
      this.name = name;
      this.type = options?.type || '';
      this.size = bits.length;
    }
    
    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(8));
    }
  },
  writable: true
});

// Mock URL.createObjectURL
Object.defineProperty(URL, 'createObjectURL', {
  value: vi.fn(() => 'mocked-url'),
  writable: true
});
Object.defineProperty(URL, 'revokeObjectURL', {
  value: vi.fn(),
  writable: true
}); 