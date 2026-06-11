/**
 * Normaliza contenido Markdown con fórmulas para remark-math + rehype-katex.
 * Cubre formatos frecuentes en respuestas de IA (bloques latex, escapes dobles).
 */
export function prepareMarkdownMath(content) {
  if (!content || typeof content !== 'string') return content

  let text = content

  text = text.replace(
    /```(?:latex|tex|math)\n([\s\S]*?)```/gi,
    (_, body) => `\n$$\n${body.trim()}\n$$\n`,
  )

  text = unescapeInMathBlocks(text, /\$\$([\s\S]*?)\$\$/g)
  text = unescapeInMathBlocks(text, /\\\[([\s\S]*?)\\\]/g, (body) => `\\[${body}\\]`)
  text = unescapeInMathBlocks(text, /\\\(([\s\S]*?)\\\)/g, (body) => `\\(${body}\\)`)
  text = unescapeInMathBlocks(
    text,
    /(?<!\$)\$(?!\$)((?:\\.|[^\n$\\])+?)\$(?!\$)/g,
    (body) => `$${body}$`,
  )

  return text
}

function unescapeInMathBlocks(text, pattern, wrap = (body) => `$$${body}$$`) {
  return text.replace(pattern, (match, body) => {
    const normalized = body.replace(/\\\\/g, '\\')
    if (normalized === body) return match
    return wrap(normalized)
  })
}
