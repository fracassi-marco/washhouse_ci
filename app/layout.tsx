import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Washhouse CI - Dashboard',
  description: 'Monitor GitHub repository CI/CD metrics, releases, and activity',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
