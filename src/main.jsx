import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initClarity } from './lib/clarity'

// Expose React globally for libs expecting window.React (dev safeguard)
if (typeof window !== 'undefined') {
  window.React = React
  initClarity()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
