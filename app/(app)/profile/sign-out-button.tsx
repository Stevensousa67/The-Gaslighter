"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2Icon, LogOutIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)

  async function handleSignOut() {
    setIsPending(true)
    try {
      await authClient.signOut()
      router.push("/")
    } catch {
      setIsPending(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleSignOut}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2Icon className="size-4 animate-spin" />
      ) : (
        <LogOutIcon className="size-4" />
      )}
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  )
}
