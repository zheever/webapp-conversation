'use client'
import 'katex/dist/katex.min.css'
import { Streamdown } from './streamdown'

interface StreamdownMarkdownProps {
  content: string
  className?: string
}

const onCodeApply = (code: string) => {
  console.log(code)

  // 检查是否存在父窗口
  if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
    try {
      // 验证父窗口域名
      const allowedOrigin = 'https://test-rock-base-admin.seasungame.com'

      window.parent.postMessage(
        {
          type: 'codeApply',
          code,
        },
        allowedOrigin,
      )
    } catch (error) {
      console.error('Error sending message to parent window:', error)
    }
  }
}

export function StreamdownMarkdown({ content, className = '' }: StreamdownMarkdownProps) {
  return (
    <div className={`streamdown-markdown ${className}`}>
      <Streamdown
        onCodeApply={onCodeApply}
      >{content}</Streamdown>
    </div >
  )
}

export default StreamdownMarkdown
