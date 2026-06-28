"use client"

import type { UIMessage } from "ai"
import { ChatInterface } from "@/components/chat/chat-interface"
import { type PersonaId } from "@/lib/personas"

interface ChatPageClientProps {
  initialMessages: UIMessage[]
  initialConversationId: string | null
  initialPersona: PersonaId
  initialClaim: string | null
  isLoggedIn: boolean
  userName: string | null
}

export function ChatPageClient({
  initialMessages,
  initialConversationId,
  initialPersona,
  initialClaim,
  isLoggedIn,
  userName,
}: ChatPageClientProps) {
  return (
    <ChatInterface
      key={initialConversationId ?? "new"}
      initialMessages={initialMessages}
      initialConversationId={initialConversationId}
      initialPersona={initialPersona}
      initialClaim={initialClaim}
      isLoggedIn={isLoggedIn}
      userName={userName}
    />
  )
}
