import type { Metadata } from 'next'
import { Nunito, Fraunces } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['300', '400', '500', '600', '700', '800'],
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '700', '900'],
})

export const metadata: Metadata = {
  title: 'Family Journal — Our Family Story',
  description: 'Record your family places, events, memories, and adventures in one beautiful journal.',
  icons: { icon: '/favicon.svg' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${nunito.variable} ${fraunces.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
