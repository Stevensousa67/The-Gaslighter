import { NextResponse } from "next/server"
import { desc, eq, sql } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { conversations, userStats } from "@/db/schema"

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rows = await db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, session.user.id))
      .orderBy(desc(conversations.updatedAt))
      .limit(50)

    return NextResponse.json(rows)
  } catch (error) {
    console.error("[GET /api/conversations]", error)
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json()) as { persona?: unknown; title?: unknown }
    const persona =
      typeof body.persona === "string" && body.persona.trim()
        ? body.persona.trim()
        : "academic"
    const title =
      typeof body.title === "string" && body.title.trim()
        ? body.title.trim()
        : "New conversation"

    const [newConversation] = await db
      .insert(conversations)
      .values({ userId: session.user.id, persona, title })
      .returning()

    // Initialise userStats row if it doesn't exist; increment totalConversations if it does
    await db
      .insert(userStats)
      .values({ userId: session.user.id, totalConversations: 1 })
      .onConflictDoUpdate({
        target: userStats.userId,
        set: {
          totalConversations: sql`${userStats.totalConversations} + 1`,
          updatedAt: new Date(),
        },
      })

    return NextResponse.json(newConversation, { status: 201 })
  } catch (error) {
    console.error("[POST /api/conversations]", error)
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    )
  }
}
