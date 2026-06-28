import { NextResponse } from "next/server"
import { eq, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { conversations, conversationMessages, userStats } from "@/db/schema"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1)

    if (!conversation) {
      return Response.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (conversation.userId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await req.json()) as { role?: unknown; content?: unknown }
    const role = body.role
    const content = body.content

    if (role !== "user" && role !== "assistant") {
      return Response.json(
        { error: "role must be 'user' or 'assistant'" },
        { status: 400 }
      )
    }

    if (typeof content !== "string" || !content.trim()) {
      return Response.json(
        { error: "content is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const [newMessage] = await db
      .insert(conversationMessages)
      .values({ conversationId: id, role, content: content.trim() })
      .returning()

    // Update conversation counters and updatedAt
    const isAssistant = role === "assistant"
    await db
      .update(conversations)
      .set({
        messageCount: sql`${conversations.messageCount} + 1`,
        wrongCount: isAssistant
          ? sql`${conversations.wrongCount} + 1`
          : conversations.wrongCount,
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, id))

    // If assistant message, increment totalWrong in userStats (upsert to be safe)
    if (isAssistant) {
      await db
        .insert(userStats)
        .values({ userId: session.user.id, totalWrong: 1 })
        .onConflictDoUpdate({
          target: userStats.userId,
          set: {
            totalWrong: sql`${userStats.totalWrong} + 1`,
            updatedAt: new Date(),
          },
        })
    }

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("[POST /api/conversations/[id]/messages]", error)
    return NextResponse.json(
      { error: "Failed to append message" },
      { status: 500 }
    )
  }
}
