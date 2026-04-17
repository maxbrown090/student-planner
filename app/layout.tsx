import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ThemeApplicator } from '@/components/providers/ThemeApplicator'
import { ToastProvider } from '@/components/ui/ToastProvider'
import { Sidebar } from '@/components/layout/Sidebar'
import { ServiceWorkerRegistration } from '@/components/providers/ServiceWorkerRegistration'

export const metadata: Metadata = {
  title: 'Tempo — Do more. Stress less.',
  description: 'AI-powered scheduling for students and busy people.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Tempo',
  },
}

export const viewport: Viewport = {
  themeColor: '#7C3BFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="flex h-screen overflow-hidden bg-app">
        <ThemeProvider>
          <ToastProvider>
            <ThemeApplicator />
            <ServiceWorkerRegistration />
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="max-w-5xl mx-auto px-6 py-8">
                {children}
              </div>
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
