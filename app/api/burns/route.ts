import { NextResponse } from "next/server"
import { desc } from "drizzle-orm"

import { db } from "@/db/drizzle"
import { burns } from "@/db/schema"

export async function GET() {
  try {
    const topBurns = await db
      .select()
      .from(burns)
      .orderBy(desc(burns.votes))
      .limit(20)

    return NextResponse.json(topBurns)
  } catch (error) {
    console.error("[GET /api/burns]", error)
    return NextResponse.json(
      { error: "Failed to fetch burns" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      userMessage?: unknown
      aiResponse?: unknown
      persona?: unknown
    }
    const { userMessage, aiResponse, persona = "academic" } = body

    if (typeof userMessage !== "string" || !userMessage.trim()) {
      return NextResponse.json(
        { error: "userMessage is required and must be a non-empty string" },
        { status: 400 }
      )
    }
    if (typeof aiResponse !== "string" || !aiResponse.trim()) {
      return NextResponse.json(
        { error: "aiResponse is required and must be a non-empty string" },
        { status: 400 }
      )
    }

    const [newBurn] = await db
      .insert(burns)
      .values({
        userMessage: userMessage.trim(),
        aiResponse: aiResponse.trim(),
        persona: typeof persona === "string" ? persona : "academic",
      })
      .returning()

    return NextResponse.json(newBurn, { status: 201 })
  } catch (error) {
    console.error("[POST /api/burns]", error)
    return NextResponse.json(
      { error: "Failed to create burn" },
      { status: 500 }
    )
  }
}
