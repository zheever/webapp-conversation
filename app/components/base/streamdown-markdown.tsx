'use client'
import 'katex/dist/katex.min.css'
import { Streamdown } from './streamdown'

interface StreamdownMarkdownProps {
  content: string
  className?: string
}

export function StreamdownMarkdown({ content, className = '' }: StreamdownMarkdownProps) {
  return (
    <div className={`streamdown-markdown ${className}`}>
      <Streamdown
        onCodeApply={(code: string) => {
          console.log(code)
        }}
      >{content}</Streamdown>
    </div >
  )
}

export default StreamdownMarkdown
