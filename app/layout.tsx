import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import "@/lib/server-init" // Initialize real-time logger

export const metadata: Metadata = {
  title: "SecLab - Security Training Platform",
  description:
    "Professional security training platform for practicing SQL injection, brute force attacks, and penetration testing in a safe environment",
  generator: "v0.app",
  keywords: ["security", "training", "penetration testing", "SQL injection", "cybersecurity", "ethical hacking"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
