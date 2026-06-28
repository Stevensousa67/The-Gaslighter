import { NextResponse } from "next/server"
import { eq, asc } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { conversations, conversationMessages } from "@/db/schema"

export async function GET(
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

    const messages = await db
      .select()
      .from(conversationMessages)
      .where(eq(conversationMessages.conversationId, id))
      .orderBy(asc(conversationMessages.createdAt))

    return NextResponse.json({ ...conversation, messages })
  } catch (error) {
    console.error("[GET /api/conversations/[id]]", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    await db.delete(conversations).where(eq(conversations.id, id))

    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("[DELETE /api/conversations/[id]]", error)
    return NextResponse.json(
      { error: "Failed to delete conversation" },
      { status: 500 }
    )
  }
}
