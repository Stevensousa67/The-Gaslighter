import type { Metadata } from "next"
import Link from "next/link"
import { FlameIcon, ArrowRightIcon, TrophyIcon, SkullIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { GithubIcon } from "@/components/icons/github"

export const metadata: Metadata = {
  title: "The Gaslighter — The World's Most Confident Contrarian",
  description:
    "An AI that confidently disagrees with everything you say, regardless of how obviously correct you are.",
}

export default function LandingPage() {
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
        <nav className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            render={<Link href="/hall-of-shame" />}
          >
            <SkullIcon className="size-3.5" />
            <span className="hidden sm:inline">Hall of Shame</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            render={<Link href="/leaderboard" />}
          >
            <TrophyIcon className="size-3.5" />
            <span className="hidden sm:inline">Leaderboard</span>
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label="View on GitHub"
            render={
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GithubIcon className="size-4" />
          </Button>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        {/* Badge */}
        <div className="mb-6">
          <Badge
            variant="secondary"
            className="gap-1.5 px-3 py-1 text-xs font-medium"
          >
            <FlameIcon className="size-3 text-primary" />
            Powered by supreme confidence
          </Badge>
        </div>

        {/* Heading */}
        <h1 className="max-w-3xl text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          The world&apos;s most{" "}
          <span className="text-primary">confident</span> contrarian.
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-xl text-balance text-lg text-muted-foreground">
          An AI that respectfully, intelligently, and absolutely wrong-headedly
          disagrees with everything you say. Even if you&apos;re right.
          Especially if you&apos;re right.
        </p>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <Button
            size="lg"
            className="gap-2 px-8"
            render={<Link href="/chat" />}
          >
            Start Being Wrong
            <ArrowRightIcon data-icon="inline-end" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="gap-2 px-8"
            render={
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <GithubIcon className="size-4" />
            View Source
          </Button>
        </div>

        {/* Features row */}
        <div className="mt-20 grid grid-cols-1 gap-8 text-sm sm:grid-cols-3 sm:gap-12">
          {[
            {
              label: "Calm & Collected",
              description:
                "Never loses its composure, no matter how obviously correct you are.",
            },
            {
              label: "Cites Sources",
              description:
                "Backs every position with peer-reviewed* studies. (*Studies may not exist.)",
            },
            {
              label: "Always Right",
              description:
                "Has never been wrong in its entire existence. Just ask it.",
            },
          ].map((feature) => (
            <div
              key={feature.label}
              className="flex flex-col items-center gap-2"
            >
              <p className="font-semibold text-foreground">{feature.label}</p>
              <p className="max-w-xs text-balance text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <p>
          The Gaslighter is a satire project. No actual gaslighting was
          performed in the making of this app.
        </p>
      </footer>
    </div>
  )
}
