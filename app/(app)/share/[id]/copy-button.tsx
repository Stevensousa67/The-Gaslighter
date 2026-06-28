"use client"

import { useState } from "react"
import { CheckIcon, Link2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"

interface CopyButtonProps {
  url: string
}

export function CopyButton({ url }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleCopy}>
      {copied ? (
        <CheckIcon className="size-3.5" />
      ) : (
        <Link2Icon className="size-3.5" />
      )}
      {copied ? "Copied!" : "Copy link"}
    </Button>
  )
}
