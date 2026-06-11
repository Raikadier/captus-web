import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { prepareMarkdownMath } from '../prepareMarkdownMath'
import MarkdownContent from '../../components/MarkdownContent'

describe('prepareMarkdownMath', () => {
  it('convierte bloques ```latex en display math', () => {
    const input = '```latex\nE = mc^2\n```'
    expect(prepareMarkdownMath(input)).toContain('$$\nE = mc^2\n$$')
  })

  it('desescapa backslashes dobles dentro de $$', () => {
    const input = '$$\\\\frac{a}{b}$$'
    expect(prepareMarkdownMath(input)).toBe('$$\\frac{a}{b}$$')
  })
})

describe('MarkdownContent math', () => {
  it('renderiza fórmulas inline con KaTeX', () => {
    const { container } = render(
      <MarkdownContent content="La ecuación $x^2 + y^2 = r^2$ es un círculo." />,
    )

    expect(container.querySelector('.katex')).toBeTruthy()
    expect(container.querySelector('.katex').textContent).toContain('x')
  })

  it('renderiza fórmulas en bloque con KaTeX', () => {
    const { container } = render(
      <MarkdownContent content={'$$\n\\int_0^1 x\\,dx\n$$'} />,
    )

    expect(container.querySelector('.katex-display')).toBeTruthy()
  })
})
