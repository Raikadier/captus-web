import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { prepareMarkdownMath } from '../lib/prepareMarkdownMath'
import 'katex/dist/katex.min.css'

function isMathCode(className) {
  return className?.includes('language-math') || className?.includes('math-inline') || className?.includes('math-display')
}

const baseComponents = {
  p: ({ children }) => (
    <p className="text-sm leading-relaxed mb-2 last:mb-0">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="text-base font-bold text-foreground mb-2 mt-3 first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-semibold text-foreground mb-1.5 mt-2.5 first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-medium text-foreground mb-1 mt-2 first:mt-0">{children}</h3>
  ),
  ul: ({ children }) => (
    <ul className="text-sm list-disc pl-4 mb-2 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="text-sm list-decimal pl-4 mb-2 space-y-1">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-primary/40 pl-3 my-2 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-3 border-border" />,
  code: ({ className, children, ...props }) => {
    if (isMathCode(className)) {
      const isDisplay = className.includes('math-display')
      return (
        <code
          className={`${className || ''} ${isDisplay ? 'block w-full' : 'inline'}`}
          {...props}
        >
          {children}
        </code>
      )
    }

    if (className) {
      return (
        <code
          className={`block bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto my-2 ${className}`}
          {...props}
        >
          {children}
        </code>
      )
    }

    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
        {children}
      </code>
    )
  },
  pre: ({ children, ...props }) => (
    <pre
      className="my-3 overflow-x-auto rounded-lg bg-transparent p-0 text-foreground"
      {...props}
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-2">
      <table className="text-xs border-collapse w-full">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
  th: ({ children }) => (
    <th className="border border-border px-2 py-1 font-medium text-left">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-2 py-1">{children}</td>
  ),
}

export default function MarkdownContent({ content, className = '' }) {
  if (!content) return null

  const preparedContent = prepareMarkdownMath(content)

  return (
    <div className={`markdown-content text-foreground ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
        components={baseComponents}
      >
        {preparedContent}
      </ReactMarkdown>
    </div>
  )
}
