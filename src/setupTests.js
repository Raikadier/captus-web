import '@testing-library/jest-dom'

// Mock matchMedia para entornos con DOM (jsdom)
// Se omite en entorno node puro (pruebas unitarias sin DOM)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: () => {},
  })
}
