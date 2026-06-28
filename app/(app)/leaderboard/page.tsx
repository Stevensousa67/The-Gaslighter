import type { Metadata } from "next"
import Link from "next/link"
import { FlameIcon, ArrowLeftIcon, TrophyIcon } from "lucide-react"
import { desc } from "drizzle-orm"

import { db } from "@/db/drizzle"
import { burns } from "@/db/schema"
import { Button } from "@/components/ui/button"
import { LeaderboardTabs, type BurnRow } from "./leaderboard-tabs"

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Browse recent burns and see who has been most comprehensively corrected by The Gaslighter.",
  openGraph: {
    title: "Leaderboard — The Gaslighter",
    description:
      "A live feed of intellectual defeats. Updated as more people discover they were wrong about things.",
  },
}

export default async function LeaderboardPage() {
  const rawBurns = await db
    .select()
    .from(burns)
    .orderBy(desc(burns.createdAt))
    .limit(20)

  // Serialize dates as ISO strings before passing to the Client Component
  const recentBurns: BurnRow[] = rawBurns.map((burn) => ({
    ...burn,
    createdAt: burn.createdAt.toISOString(),
  }))

  return (
    <div className="min-h-svh bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/50 bg-background/80 px-6 py-4 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary">
            <FlameIcon className="size-3.5 text-primary-foreground" />
          </div>
          The Gaslighter
        </Link>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/chat" />}
          nativeButton={false}
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to Chat
        </Button>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        {/* Hero header */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <TrophyIcon className="size-8 text-primary" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Leaderboard
          </h1>
          <p className="mx-auto max-w-xl text-balance text-lg text-muted-foreground">
            A live feed of intellectual defeats. Updated in real time as more
            people discover they were wrong about things they were absolutely
            certain about.
          </p>
        </div>

        <LeaderboardTabs burns={recentBurns} />
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>Statistics are neutral. The AI is not.</p>
      </footer>
    </div>
  )
}
