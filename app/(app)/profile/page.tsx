import type { Metadata } from "next"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeftIcon, CalendarIcon, FlameIcon, MessageSquareIcon, TrophyIcon, ZapIcon } from "lucide-react"

import { auth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SignOutButton } from "@/app/(app)/profile/sign-out-button"

export const metadata: Metadata = {
  title: "Your Record of Wrongness",
  description: "A detailed account of every time you were confidently incorrect.",
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?"
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("")
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Unknown"
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })
}

// Placeholder stats — replace with real API calls when /api/user/stats is implemented
const PLACEHOLDER_STATS = {
  totalWrong: 47,
  totalConversations: 12,
  longestStreak: 5,
}

// Placeholder achievements — replace with real API calls when /api/achievements is implemented
const PLACEHOLDER_ACHIEVEMENTS = [
  {
    id: "first_wrong",
    emoji: "🎯",
    name: "First Mistake",
    description: "Had your first belief professionally dismantled.",
    unlockedAt: new Date("2024-01-15"),
  },
  {
    id: "committed",
    emoji: "💪",
    name: "Committed to the Bit",
    description: "Argued the same wrong position across 3 conversations.",
    unlockedAt: new Date("2024-01-22"),
  },
  {
    id: "graceful",
    emoji: "🎭",
    name: "Graceful Loser",
    description: "Accepted defeat with dignity. Twice.",
    unlockedAt: new Date("2024-02-05"),
  },
  {
    id: "overconfident",
    emoji: "🦚",
    name: "Overconfidence Achieved",
    description: "Started a conversation with \"Actually, I'm definitely right about this.\"",
    unlockedAt: new Date("2024-02-18"),
  },
]

export default async function ProfilePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const { user } = session
  const initials = getInitials(user.name)
  const joinDate = formatDate(user.createdAt)

  return (
    <div className="min-h-svh bg-background">
      {/* Header nav */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-muted-foreground"
          render={<Link href="/chat" />}
        >
          <ArrowLeftIcon className="size-4" />
          Back to chat
        </Button>
        <SignOutButton />
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 pb-16 sm:px-6">
        {/* Profile hero */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <Avatar size="lg" className="size-20 text-xl">
                {user.image && <AvatarImage src={user.image} alt={user.name ?? "User"} />}
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-start">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {user.name ?? "Anonymous Arguer"}
                  </h1>
                  <Badge variant="secondary" className="gap-1">
                    <FlameIcon className="size-3 text-primary" />
                    Professionally Wrong
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
                  <CalendarIcon className="size-3" />
                  Member since {joinDate}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Witty header */}
        <div className="text-center sm:text-left">
          <h2 className="text-xl font-semibold tracking-tight">Your Record of Wrongness</h2>
          <p className="text-sm text-muted-foreground">
            A comprehensive log of your intellectual defeats.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10">
                <ZapIcon className="size-4 text-destructive" />
              </div>
              <p className="text-2xl font-bold">{PLACEHOLDER_STATS.totalWrong}</p>
              <p className="text-xs text-muted-foreground leading-tight">Times Wrong</p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
                <MessageSquareIcon className="size-4 text-primary" />
              </div>
              <p className="text-2xl font-bold">{PLACEHOLDER_STATS.totalConversations}</p>
              <p className="text-xs text-muted-foreground leading-tight">Conversations</p>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-4 text-center">
              <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
                <TrophyIcon className="size-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold">{PLACEHOLDER_STATS.longestStreak}</p>
              <p className="text-xs text-muted-foreground leading-tight">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Achievements */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Achievements</h2>
            <p className="text-sm text-muted-foreground">
              Badges earned through consistent wrongness.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PLACEHOLDER_ACHIEVEMENTS.map((achievement) => (
              <Card key={achievement.id} size="sm">
                <CardContent className="flex items-start gap-3 py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                    {achievement.emoji}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-medium text-sm leading-tight">{achievement.name}</p>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-muted-foreground/60 pt-0.5">
                      Unlocked {formatDate(achievement.unlockedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
