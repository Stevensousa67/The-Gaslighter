import { NextResponse } from "next/server"
import { eq, and } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { achievements } from "@/db/schema"

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const rows = await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, session.user.id))

    return NextResponse.json(rows)
  } catch (error) {
    console.error("[GET /api/achievements]", error)
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
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

    const body = (await req.json()) as { achievementKey?: unknown }
    const achievementKey = body.achievementKey

    if (typeof achievementKey !== "string" || !achievementKey.trim()) {
      return Response.json(
        { error: "achievementKey is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    // Idempotent: return existing record if already unlocked
    const [existing] = await db
      .select()
      .from(achievements)
      .where(
        and(
          eq(achievements.userId, session.user.id),
          eq(achievements.achievementKey, achievementKey.trim())
        )
      )
      .limit(1)

    if (existing) {
      return NextResponse.json(existing)
    }

    const [newAchievement] = await db
      .insert(achievements)
      .values({ userId: session.user.id, achievementKey: achievementKey.trim() })
      .returning()

    return NextResponse.json(newAchievement, { status: 201 })
  } catch (error) {
    console.error("[POST /api/achievements]", error)
    return NextResponse.json(
      { error: "Failed to unlock achievement" },
      { status: 500 }
    )
  }
}
