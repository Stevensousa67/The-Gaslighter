import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { conversations } from "@/db/schema"

export async function PATCH(
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

    const body = (await req.json()) as { title?: unknown }
    const title = body.title

    if (typeof title !== "string" || !title.trim()) {
      return Response.json(
        { error: "title is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const [updated] = await db
      .update(conversations)
      .set({ title: title.trim(), updatedAt: new Date() })
      .where(eq(conversations.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[PATCH /api/conversations/[id]/title]", error)
    return NextResponse.json(
      { error: "Failed to update title" },
      { status: 500 }
    )
  }
}
