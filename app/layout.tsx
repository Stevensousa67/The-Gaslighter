import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "The Gaslighter",
    template: "%s — The Gaslighter",
  },
  description:
    "An AI that confidently disagrees with everything you say. Because you're probably wrong.",
  openGraph: {
    title: "The Gaslighter",
    description: "The world's most confident contrarian.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", inter.variable, fontMono.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
