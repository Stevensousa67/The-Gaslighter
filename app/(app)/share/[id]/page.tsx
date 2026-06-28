import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { ArrowLeftIcon, FlameIcon, Share2Icon, ThumbsUpIcon } from "lucide-react"

import { db } from "@/db/drizzle"
import { burns } from "@/db/schema"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { CopyButton } from "./copy-button"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const burn = await db
    .select()
    .from(burns)
    .where(eq(burns.id, id))
    .limit(1)
    .then((r) => r[0])

  if (!burn) return { title: "Burn Not Found" }

  const baseUrl =
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  const ogUrl = new URL("/api/og", baseUrl)
  ogUrl.searchParams.set("message", burn.userMessage)
  ogUrl.searchParams.set("response", burn.aiResponse)
  ogUrl.searchParams.set("persona", burn.persona)

  const shortTitle =
    burn.aiResponse.length > 120
      ? burn.aiResponse.slice(0, 117) + "..."
      : burn.aiResponse

  const shortMessage =
    burn.userMessage.length > 100
      ? burn.userMessage.slice(0, 97) + "..."
      : burn.userMessage

  return {
    title: shortTitle,
    openGraph: {
      title: `"${shortTitle}" — The Gaslighter`,
      description: `User said: "${shortMessage}"`,
      images: [{ url: ogUrl.toString(), width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `"${shortTitle}" — The Gaslighter`,
      description: `User said: "${shortMessage}"`,
      images: [ogUrl.toString()],
    },
  }
}

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const burn = await db
    .select()
    .from(burns)
    .where(eq(burns.id, id))
    .limit(1)
    .then((r) => r[0])

  if (!burn) notFound()

  const baseUrl =
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "http://localhost:3000"
  const shareUrl = `${baseUrl}/share/${burn.id}`

  const tweetText = `"${burn.aiResponse.slice(0, 180)}" — The Gaslighter`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`

  const formattedDate = new Date(burn.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const personaLabel = burn.persona.charAt(0).toUpperCase() + burn.persona.slice(1)

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary">
            <FlameIcon className="size-3.5 text-primary-foreground" />
          </div>
          The Gaslighter
        </Link>
        <ThemeToggle />
      </header>

      {/* Main content */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-10">
        {/* Back link */}
        <Link
          href="/chat"
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Try to prove us wrong
        </Link>

        {/* Burn card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary">{personaLabel}</Badge>
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {/* User message */}
            <div className="rounded-2xl bg-muted/50 px-4 py-3">
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                User claimed:
              </p>
              <p className="text-sm italic text-foreground/80">
                &ldquo;{burn.userMessage}&rdquo;
              </p>
            </div>

            <Separator />

            {/* AI response */}
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                The Gaslighter responded:
              </p>
              <p className="text-base font-semibold leading-relaxed text-foreground">
                {burn.aiResponse}
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-4">
            {/* Vote count */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ThumbsUpIcon className="size-3.5" />
                <span>{burn.votes}</span>
              </Button>
            </div>

            {/* Share actions */}
            <div className="flex items-center gap-2">
              <CopyButton url={shareUrl} />
              <Button
                variant="outline"
                size="sm"
                render={
                  <a
                    href={twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Share2Icon className="size-3.5" />
                Share on X
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <p className="text-sm text-muted-foreground">
            Think you can say something that won&apos;t get destroyed?
          </p>
          <Button render={<Link href="/chat" />} nativeButton={false}>
            <FlameIcon className="size-3.5" />
            Try The Gaslighter
          </Button>
        </div>
      </main>
    </div>
  )
}
