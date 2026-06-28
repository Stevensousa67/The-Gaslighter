import type { Metadata } from "next"
import Link from "next/link"
import { FlameIcon, CalendarIcon, ArrowRightIcon, SparklesIcon } from "lucide-react"

import { getDailyChallenge } from "@/lib/daily-claims"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Daily Challenge — The Gaslighter",
  description: "Defend today's claim against The Gaslighter. One new challenge every day.",
}

export default function DailyPage() {
  const challenge = getDailyChallenge()

  const displayDate = new Date(challenge.date + "T00:00:00").toLocaleDateString(
    "en-US",
    { weekday: "long", year: "numeric", month: "long", day: "numeric" }
  )

  const encodedClaim = encodeURIComponent(challenge.claim)
  const chatHref = `/chat?daily=true&claim=${encodedClaim}`

  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
            <FlameIcon className="size-4 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">The Gaslighter</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground"
          render={<Link href="/" />}
          nativeButton={false}
        >
          Back to Home
        </Button>
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Header section */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Badge
              variant="secondary"
              className="gap-1.5 px-3 py-1 text-xs font-medium"
            >
              <CalendarIcon className="size-3 text-primary" />
              Daily Challenge
            </Badge>

            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
              Today&apos;s Challenge
            </h1>

            <p className="max-w-md text-balance text-base text-muted-foreground">
              The Gaslighter has a claim for you to defend. It will disagree
              with everything you say — no matter how right you are.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="size-3" />
              <span>{displayDate}</span>
            </div>
          </div>

          {/* Claim card */}
          <Card className="border-primary/20 bg-primary/5 ring-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-md bg-primary/10">
                  <FlameIcon className="size-3.5 text-primary" />
                </div>
                <CardTitle className="text-sm font-medium uppercase tracking-widest text-primary/70">
                  Defend This Claim
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-center text-2xl font-semibold leading-snug tracking-tight text-foreground sm:text-3xl">
                &ldquo;{challenge.claim}&rdquo;
              </p>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card size="sm">
            <CardHeader>
              <CardTitle className="text-sm">How it works</CardTitle>
              <CardDescription>
                Your mission, should you choose to accept it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  1
                </span>
                <p>Click &ldquo;Accept the Challenge&rdquo; to enter the chat.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  2
                </span>
                <p>Argue in defense of today&apos;s claim as convincingly as you can.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  3
                </span>
                <p>
                  The Gaslighter will disagree with everything — that&apos;s the whole point. Embrace being wrong.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="w-full gap-2 sm:w-auto sm:px-10"
              render={<Link href={chatHref} />}
              nativeButton={false}
            >
              Accept the Challenge
              <ArrowRightIcon data-icon="inline-end" />
            </Button>

            <Separator className="w-full max-w-xs" />

            {/* Comeback tomorrow teaser */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <SparklesIcon className="size-3 text-primary/60" />
                A new claim drops every day at midnight UTC
              </div>
              <p className="max-w-xs text-xs text-muted-foreground/70">
                Come back tomorrow for a fresh claim to defend — if you dare.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>The Gaslighter is a satire project. No actual gaslighting was performed.</p>
      </footer>
    </div>
  )
}
