"use client"

import Link from "next/link"
import { FlameIcon, ClockIcon, TrophyIcon, SparklesIcon } from "lucide-react"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

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

export type BurnRow = {
  id: string
  userMessage: string
  aiResponse: string
  persona: string
  votes: number
  createdAt: string
}

interface LeaderboardTabsProps {
  burns: BurnRow[]
}

export function LeaderboardTabs({ burns }: LeaderboardTabsProps) {
  return (
    <Tabs defaultValue="recent-burns">
      <div className="flex justify-center">
        <TabsList className="mb-10">
          <TabsTrigger value="recent-burns">
            <FlameIcon className="size-3.5" />
            Recent Burns
          </TabsTrigger>
          <TabsTrigger value="coming-soon">
            <TrophyIcon className="size-3.5" />
            Leaderboard
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="recent-burns">
        {burns.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3">
            {burns.map((burn, index) => {
              const config = getPersonaConfig(burn.persona)
              return (
                <RecentBurnRow
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
      </TabsContent>

      <TabsContent value="coming-soon">
        <ComingSoon />
      </TabsContent>
    </Tabs>
  )
}

function RecentBurnRow({
  burn,
  rank,
  personaLabel,
  personaVariant,
}: {
  burn: BurnRow
  rank: number
  personaLabel: string
  personaVariant: PersonaVariant
}) {
  const timeAgo = formatTimeAgo(burn.createdAt)

  return (
    <Card size="sm" className="transition-shadow duration-200 hover:shadow-md">
      <CardContent className="py-4">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold tabular-nums text-muted-foreground">
            {rank}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={personaVariant}>{personaLabel}</Badge>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <ClockIcon className="size-3" />
                {timeAgo}
              </span>
            </div>
            <p className="line-clamp-2 text-sm text-foreground">
              <span className="font-medium text-muted-foreground">User: </span>
              {burn.userMessage}
            </p>
            <p className="line-clamp-2 text-sm italic text-foreground/80">
              <span className="font-medium not-italic text-primary">AI: </span>
              &ldquo;
              {burn.aiResponse.length > 120
                ? burn.aiResponse.slice(0, 120) + "…"
                : burn.aiResponse}
              &rdquo;
            </p>
          </div>

          {/* Vote count */}
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <div className="flex items-center gap-1">
              <FlameIcon className="size-3.5 text-primary" />
              <span className="text-sm font-semibold tabular-nums">
                {burn.votes}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {burn.votes === 1 ? "vote" : "votes"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ComingSoon() {
  const features = [
    {
      icon: FlameIcon,
      label: "Longest Streak",
      description:
        "Track multi-turn conversations where you kept arguing and kept losing.",
    },
    {
      icon: SparklesIcon,
      label: "Most Creative",
      description: "Burns so eloquent they deserve to be framed and hung.",
    },
    {
      icon: TrophyIcon,
      label: "Hall of Infamy",
      description:
        "Users who tried hardest and failed most consistently. You know who you are.",
    },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col items-center gap-4 py-6 text-center sm:py-8">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
              <TrophyIcon className="size-8 text-primary" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold tracking-tight sm:text-3xl">
                Full Leaderboard Coming Soon
              </p>
              <p className="mx-auto max-w-md text-balance text-muted-foreground">
                We&apos;re building something special — a full conversation
                leaderboard tracking the longest chains of wrongness, the most
                creative defeats, and the users with the most illustrious
                records of being corrected.
              </p>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="py-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, label, description }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-3 rounded-2xl bg-muted/50 p-5 text-center"
              >
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground">{label}</p>
                <p className="text-xs text-balance text-muted-foreground">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>

        <Separator />

        <CardFooter className="justify-center py-6">
          <Button render={<Link href="/chat" />} variant="outline">
            Accumulate Defeats Now
          </Button>
        </CardFooter>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Conversation tracking is in development. Your defeats are already being
        catalogued. Silently.
      </p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-4xl border border-dashed border-border py-20 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
        <FlameIcon className="size-8 text-muted-foreground/50" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold">No burns on record.</p>
        <p className="mx-auto max-w-sm text-balance text-sm text-muted-foreground">
          The scoreboard is empty. This is either a very new app or everyone is
          quietly accepting they were wrong. Both outcomes satisfy us.
        </p>
      </div>
      <Button render={<Link href="/chat" />}>Start the Record Books</Button>
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return "just now"
}
