import React from 'react'
import MarkdownContent from '../../components/MarkdownContent'

export default function NoteContent({ content, className = '' }) {
  if (!content) return null

  return (
    <MarkdownContent
      content={content}
      className={`text-muted-foreground ${className}`}
    />
  )
}
