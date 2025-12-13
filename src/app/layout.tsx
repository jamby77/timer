import './globals.css'

import { ReactNode } from 'react'
import { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { ThemeProvider } from '@/providers/theme-provider'
import { cn } from '@/lib/utils'

import { Toaster } from '@/components/ui/sonner'
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Advanced Workout Timer | %s',
    default: 'Advanced Workout Timer',
  },
  description: 'A versatile timer application for workouts and productivity',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  keywords: ['fitness', 'health', 'utilities'],
  icons: {
    icon: {
      url: '/favicon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
    },
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: {
      rel: 'icon',
      url: '/favicon-96x96.png',
      sizes: '96x96',
      type: 'image/png',
    },
  },
  appleWebApp: {
    title: 'Advanced Workout Timer',
    statusBarStyle: 'black-translucent',
  },
}

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn('flex h-full min-h-screen flex-col', inter.className)}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navigation />

          <main className="bg-background inset-0 h-full grow">{children}</main>
          <Toaster position="top-center" duration={10000} richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}

export default Layout
