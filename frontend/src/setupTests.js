// src/setupTests.js
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder/TextDecoder for Jest environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock window.location for navigation tests
Object.defineProperty(window, 'location', {
  value: {
    reload: jest.fn(),
    assign: jest.fn(),
    replace: jest.fn(),
    href: 'http://localhost/'
  },
  writable: true,
  configurable: true
});
