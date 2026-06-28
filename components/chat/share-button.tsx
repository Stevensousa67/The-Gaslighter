"use client"

import { useState } from "react"
import { Share2Icon, CheckIcon, FlameIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { type PersonaId } from "@/lib/personas"

interface ShareButtonProps {
  userMessage: string
  aiResponse: string
  persona: PersonaId
  onShared?: () => void
}

export function ShareButton({
  userMessage,
  aiResponse,
  persona,
  onShared,
}: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [shared, setShared] = useState(false)

  const handleShare = async () => {
    if (isLoading || shared) return
    setIsLoading(true)

    try {
      const res = await fetch("/api/burns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: userMessage.slice(0, 500),
          aiResponse: aiResponse.slice(0, 1000),
          persona,
        }),
      })

      if (!res.ok) throw new Error("Failed to save")

      const burn = await res.json()
      const shareUrl = `${window.location.origin}/share/${burn.id}`

      await navigator.clipboard.writeText(shareUrl)
      setShared(true)
      onShared?.()

      toast.success("Link copied!", {
        description: "Share this AI burn with the world.",
        action: {
          label: "View",
          onClick: () => window.open(shareUrl, "_blank"),
        },
      })

      setTimeout(() => setShared(false), 3000)
    } catch {
      toast.error("Couldn't save this burn", {
        description: "Try again in a moment.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      disabled={isLoading}
      className="h-6 gap-1 px-2 text-[11px] text-muted-foreground/60 hover:text-muted-foreground"
      aria-label="Share this AI response"
    >
      {shared ? (
        <>
          <CheckIcon className="size-3" />
          Copied!
        </>
      ) : (
        <>
          <FlameIcon className="size-3" />
          Share burn
        </>
      )}
    </Button>
  )
}
