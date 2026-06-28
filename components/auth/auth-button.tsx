"use client"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return null

  if (session) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => authClient.signOut()}
      >
        Sign out
      </Button>
    )
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => authClient.signIn.social({ provider: "github" })}
    >
      Sign in with GitHub
    </Button>
  )
}
