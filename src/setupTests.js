import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'

// We don't use afterEach here since vitest globals are enabled
// The cleanup is handled by the test files themselves if needed

// Mock matchMedia para entornos con DOM (jsdom)
// Se omite en entorno node puro (pruebas unitarias sin DOM)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => {},
  })
}
