import React from 'react'

export default function Loading({ message = 'Cargando...', fullScreen = true }) {
  const containerClass = fullScreen
    ? "min-h-screen bg-[#F6F7FB] flex items-center justify-center"
    : "flex items-center justify-center py-12"

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        {message && <p className="mt-4 text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}
