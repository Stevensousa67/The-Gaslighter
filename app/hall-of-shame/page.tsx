import type { Metadata } from "next"
import Link from "next/link"
import { FlameIcon, ArrowLeftIcon } from "lucide-react"
import { desc } from "drizzle-orm"

import { db } from "@/db/drizzle"
import { burns } from "@/db/schema"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ShareButton } from "./share-button"

export const metadata: Metadata = {
  title: "Hall of Shame",
  description:
    "The most devastating AI takedowns, immortalized for posterity. Browse the intellectual defeats voted most worthy of public mockery.",
  openGraph: {
    title: "Hall of Shame — The Gaslighter",
    description:
      "These brave souls said something. The Gaslighter disagreed. Spectacularly.",
  },
}

type PersonaVariant = "default" | "secondary" | "outline" | "ghost"

const PERSONA_CONFIG: Record<string, { label: string; variant: PersonaVariant }> =
  {
    academic: { label: "Academic", variant: "default" },
    zen: { label: "Zen Master", variant: "secondary" },
    consultant: { label: "Consultant", variant: "outline" },
    enthusiast: { label: "Enthusiast", variant: "ghost" },
  }

function getPersonaConfig(persona: string): {
  label: string
  variant: PersonaVariant
} {
  return PERSONA_CONFIG[persona] ?? { label: persona, variant: "outline" }
}

type Burn = typeof burns.$inferSelect

export default async function HallOfShamePage() {
  const topBurns = await db
    .select()
    .from(burns)
    .orderBy(desc(burns.votes))
    .limit(20)

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
        >
          <ArrowLeftIcon data-icon="inline-start" />
          Back to Chat
        </Button>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        {/* Hero header */}
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <FlameIcon className="size-8 text-primary" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Hall of Shame
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
            These brave souls said something. The Gaslighter respectfully,
            thoroughly, and irreversibly disagreed. The following records stand
            as a monument to human overconfidence.
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
            <FlameIcon className="size-3.5 text-primary" />
            <span>
              {topBurns.length}{" "}
              {topBurns.length === 1 ? "documented defeat" : "documented defeats"}
            </span>
          </div>
        </div>

        {topBurns.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {topBurns.map((burn, index) => {
              const config = getPersonaConfig(burn.persona)
              return (
                <BurnCard
                  key={burn.id}
                  burn={burn}
                  rank={index + 1}
                  personaLabel={config.label}
                  personaVariant={config.variant}
                />
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
        <p>No actual shame was inflicted. The AI feels nothing. Unlike you.</p>
      </footer>
    </div>
  )
}

function BurnCard({
  burn,
  rank,
  personaLabel,
  personaVariant,
}: {
  burn: Burn
  rank: number
  personaLabel: string
  personaVariant: PersonaVariant
}) {
  return (
    <Card className="flex flex-col transition-shadow duration-200 hover:shadow-lg">
      <CardHeader className="gap-3">
        <div className="flex items-center justify-between">
          <Badge variant={personaVariant}>{personaLabel}</Badge>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            #{rank}
          </span>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What they said
          </p>
          <p className="mt-1 line-clamp-3 text-sm text-foreground">
            {burn.userMessage}
          </p>
        </div>
      </CardHeader>

      <Separator className="mx-6" />

      <CardContent className="flex-1 pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          The verdict
        </p>
        <blockquote className="mt-2 border-l-2 border-primary pl-3 text-sm italic leading-relaxed text-foreground/90">
          &ldquo;
          {burn.aiResponse.length > 180
            ? burn.aiResponse.slice(0, 180) + "…"
            : burn.aiResponse}
          &rdquo;
        </blockquote>
      </CardContent>

      <CardFooter className="border-t border-border/50 mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <FlameIcon className="size-3.5 text-primary" />
          <span className="text-sm font-semibold tabular-nums">
            {burn.votes}
          </span>
          <span className="text-xs text-muted-foreground">
            {burn.votes === 1 ? "vote" : "votes"}
          </span>
        </div>
        <ShareButton userMessage={burn.userMessage} />
      </CardFooter>
    </Card>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-4xl border border-dashed border-border py-24 text-center">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-muted">
        <FlameIcon className="size-10 text-muted-foreground/50" />
      </div>
      <div className="space-y-2">
        <p className="text-xl font-semibold">Nothing here. Suspicious.</p>
        <p className="mx-auto max-w-sm text-balance text-muted-foreground">
          Either no one has been humiliated yet, or everyone is too embarrassed
          to admit they argued with an AI. Both are plausible.
        </p>
      </div>
      <Button render={<Link href="/chat" />}>Be the First Casualty</Button>
    </div>
  )
}
