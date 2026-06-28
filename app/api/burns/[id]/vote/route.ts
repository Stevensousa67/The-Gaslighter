import { NextResponse } from "next/server"
import { eq, sql } from "drizzle-orm"

import { db } from "@/db/drizzle"
import { burns } from "@/db/schema"

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const [updatedBurn] = await db
      .update(burns)
      .set({ votes: sql`${burns.votes} + 1` })
      .where(eq(burns.id, id))
      .returning()

    if (!updatedBurn) {
      return NextResponse.json({ error: "Burn not found" }, { status: 404 })
    }

    return NextResponse.json(updatedBurn)
  } catch (error) {
    console.error("[POST /api/burns/[id]/vote]", error)
    return NextResponse.json(
      { error: "Failed to register vote" },
      { status: 500 }
    )
  }
}
