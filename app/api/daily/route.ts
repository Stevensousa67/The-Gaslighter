import { NextResponse } from "next/server"
import { getDailyChallenge } from "@/lib/daily-claims"

export function GET() {
  const challenge = getDailyChallenge()
  return NextResponse.json(challenge)
}
