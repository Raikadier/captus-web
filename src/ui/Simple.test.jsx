import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Simple } from './Simple'

describe('Simple Component', () => {
  it('renders correctly', () => {
    render(<Simple />)
    expect(screen.getByText('Simple UI Component')).toBeInTheDocument()
  })
})
