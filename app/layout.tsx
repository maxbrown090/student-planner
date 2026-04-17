import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeApplicator } from '@/components/providers/ThemeApplicator'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'Tempo — Do more. Stress less.',
  description: 'AI-powered scheduling for students and busy people.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex h-screen overflow-hidden bg-app">
        <ThemeProvider>
          <ThemeApplicator />
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
