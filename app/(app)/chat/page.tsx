import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/db/drizzle"
import { conversations, conversationMessages } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"
import type { Metadata } from "next"
import { ChatPageClient } from "@/components/chat/chat-page-client"
import type { UIMessage } from "ai"

export const metadata: Metadata = {
  title: "Chat",
}

interface Props {
  searchParams: Promise<{ c?: string; claim?: string }>
}

export default async function ChatPage({ searchParams }: Props) {
  const params = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })

  let initialMessages: UIMessage[] = []
  let initialConversationId: string | null = null
  let initialPersona: string | null = null

  if (params.c && session) {
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, params.c),
          eq(conversations.userId, session.user.id),
        ),
      )
      .limit(1)

    if (conv) {
      initialConversationId = conv.id
      initialPersona = conv.persona

      const msgs = await db
        .select()
        .from(conversationMessages)
        .where(eq(conversationMessages.conversationId, conv.id))
        .orderBy(asc(conversationMessages.createdAt))

      initialMessages = msgs.map((m) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        parts: [{ type: "text" as const, text: m.content }],
        metadata: {},
      }))
    }
  }

  return (
    <ChatPageClient
      initialMessages={initialMessages}
      initialConversationId={initialConversationId}
      initialPersona={(initialPersona as import("@/lib/personas").PersonaId) ?? "academic"}
      initialClaim={params.claim ?? null}
      isLoggedIn={!!session}
      userName={session?.user?.name ?? null}
    />
  )
}
