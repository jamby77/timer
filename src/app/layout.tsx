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
  title: 'Timer App',
  description: 'A versatile timer application for workouts and productivity',
}

const Layout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('flex h-full min-h-screen flex-col', inter.className)}>
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
