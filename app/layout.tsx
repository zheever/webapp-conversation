import { getLocaleOnServer } from '@/i18n/server'

import './styles/globals.css'
import './styles/markdown.scss'

const LocaleLayout = async ({
  children,
}: {
  children: React.ReactNode
}) => {
  const locale = await getLocaleOnServer()
  return (
    <html lang={locale ?? 'en'} className="h-full" style={{
      background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(14, 165, 233))',
    }}>
      <body className="h-full" style={{
        overflow: 'hidden',
      }}>
        <div className="overflow-x-auto px-[2px] pb-[2px]">
          <div className=" min-w-[300px]">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}

export default LocaleLayout
