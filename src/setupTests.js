import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// We don't use afterEach here since vitest globals are enabled
// The cleanup is handled by the test files themselves if needed

// Mock matchMedia for all tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: () => { }
})
