"use client";

import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Volební kalkulačka 2025 | NMS',
  description: 'Porovnejte své politické postoje s programy hlavních politických stran',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="cs">
      <body>
        {children}
      </body>
    </html>
  )
} 