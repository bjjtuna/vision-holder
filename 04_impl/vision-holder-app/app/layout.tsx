import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vision Holder - AI Coding Assistant for Everyone',
  description: 'An AI-powered coding assistant designed to help people with ADHD, dyslexia, and those who can\'t code achieve more control and structure in their development process.',
  keywords: ['AI', 'coding assistant', 'accessibility', 'ADHD', 'dyslexia', 'neurodiverse', 'coding help'],
  authors: [{ name: 'Vision Holder Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Vision Holder - AI Coding Assistant for Everyone',
    description: 'An AI-powered coding assistant designed to help people with ADHD, dyslexia, and those who can\'t code achieve more control and structure in their development process.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vision Holder - AI Coding Assistant for Everyone',
    description: 'An AI-powered coding assistant designed to help people with ADHD, dyslexia, and those who can\'t code achieve more control and structure in their development process.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Dyslexia-friendly font preload */}
        <link
          rel="preload"
          href="/fonts/OpenDyslexic-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/OpenDyslexic-Bold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* High contrast mode support */}
        <meta name="color-scheme" content="light dark" />
        {/* Accessibility meta tags */}
        <meta name="theme-color" content="#0ea5e9" />
        <meta name="msapplication-TileColor" content="#0ea5e9" />
      </head>
      <body 
        className={`${inter.className} antialiased bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
        style={{
          fontFeatureSettings: '"liga" 1, "kern" 1',
          textRendering: 'optimizeLegibility',
        }}
      >
        {/* Skip to main content link for screen readers */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
        
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  )
} 