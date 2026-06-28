import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/db/drizzle"
import { userStats } from "@/db/schema"

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [stats] = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, session.user.id))
      .limit(1)

    if (!stats) {
      // Return defaults if no stats row exists yet
      return NextResponse.json({
        userId: session.user.id,
        totalWrong: 0,
        totalConversations: 0,
        longestStreak: 0,
        updatedAt: null,
      })
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("[GET /api/user/stats]", error)
    return NextResponse.json(
      { error: "Failed to fetch user stats" },
      { status: 500 }
    )
  }
}
