import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Expose React globally for libs expecting window.React (dev safeguard)
if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-undef
  window.React = React
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
