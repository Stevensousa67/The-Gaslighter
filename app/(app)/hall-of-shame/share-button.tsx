"use client"

import { useState } from "react"
import { ShareIcon, CheckIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface ShareButtonProps {
  userMessage: string
}

export function ShareButton({ userMessage }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = window.location.href
    const text = `"${userMessage.slice(0, 100)}${userMessage.length > 100 ? "..." : ""}" — Someone was wrong on the internet. The Gaslighter fixed it.`

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "The Gaslighter — Hall of Shame",
          text,
          url,
        })
      } catch {
        // User cancelled the share dialog — no action needed
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        // Clipboard not available
      }
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      aria-label="Share this burn"
      className="min-h-[44px] gap-1.5 text-xs"
    >
      {copied ? (
        <>
          <CheckIcon className="size-3.5" />
          Copied!
        </>
      ) : (
        <>
          <ShareIcon className="size-3.5" />
          Share
        </>
      )}
    </Button>
  )
}
