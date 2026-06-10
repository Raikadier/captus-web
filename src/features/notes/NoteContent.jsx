import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export default function NoteContent({ content, className = '' }) {
  if (!content) return null

  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      className={`prose prose-sm dark:prose-invert max-w-none text-muted-foreground ${className}`}
      components={{
        h1: ({ children }) => <h1 className="text-base font-bold text-foreground mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-semibold text-foreground mb-1">{children}</h2>,
        p: ({ children }) => <p className="text-sm mb-1 last:mb-0">{children}</p>,
        code: ({ inline, children }) =>
          inline
            ? <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>
            : <code className="block bg-muted p-2 rounded text-xs font-mono overflow-x-auto">{children}</code>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
