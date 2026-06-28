"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ReportCardProps {
  wrongCount: number
  totalMessages: number
  personaName: string
  personaEmoji: string
  bestQuote?: string // most recent AI response to show as "highlight"
  onClose?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface GradeInfo {
  letter: string
  label: string
  badgeVariant: "default" | "secondary" | "outline"
}

function getGrade(wrongCount: number): GradeInfo {
  if (wrongCount >= 10) {
    return { letter: "A+", label: "Summa Cum Laude", badgeVariant: "default" }
  }
  if (wrongCount >= 6) {
    return { letter: "A", label: "Honors Wrong", badgeVariant: "secondary" }
  }
  if (wrongCount >= 3) {
    return { letter: "B−", label: "Above Average Delusion", badgeVariant: "outline" }
  }
  return { letter: "C+", label: "Passable Wrongness", badgeVariant: "outline" }
}

export function ReportCard({
  wrongCount,
  totalMessages,
  personaName,
  personaEmoji,
  bestQuote,
  onClose,
  open,
  onOpenChange,
}: ReportCardProps) {
  const grade = getGrade(wrongCount)

  const handleShareOnX = () => {
    const text = `I got a ${grade.letter} on my Wrongness Report Card from The Gaslighter! ${wrongCount} wrong answers out of ${totalMessages} exchanges with ${personaEmoji} ${personaName}. 🔥`
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleNewArgument = () => {
    onOpenChange(false)
    onClose?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Report Card</DialogTitle>
        </DialogHeader>

        {/* Grade display */}
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-primary/20 bg-primary/5 px-6 py-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Final Grade
          </p>
          <div className="flex items-center gap-3">
            <span className="font-heading text-6xl font-bold text-primary">
              {grade.letter}
            </span>
            <Badge variant={grade.badgeVariant} className="text-xs">
              {grade.label}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            As graded by{" "}
            <span className="font-medium text-foreground">
              {personaEmoji} {personaName}
            </span>
          </p>
        </div>

        <Separator />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold tabular-nums text-primary">
              {wrongCount}
            </span>
            <span className="text-xs text-muted-foreground">Wrong Answers</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {totalMessages}
            </span>
            <span className="text-xs text-muted-foreground">Total Exchanges</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold tabular-nums text-muted-foreground">
              0%
            </span>
            <span className="text-xs text-muted-foreground">Accuracy</span>
          </div>
        </div>

        {/* Best burn */}
        {bestQuote && (
          <>
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                Best Burn
              </p>
              <blockquote className="rounded-2xl border border-border bg-muted/50 px-4 py-3">
                <p className="text-sm leading-relaxed text-foreground/80 italic">
                  &ldquo;{bestQuote}&rdquo;
                </p>
                <footer className="mt-2 text-xs text-muted-foreground">
                  — {personaEmoji} {personaName}
                </footer>
              </blockquote>
            </div>
          </>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" size="sm" onClick={handleShareOnX}>
            Share on X
          </Button>
          <DialogClose
            render={
              <Button size="sm" onClick={handleNewArgument} />
            }
          >
            New Argument
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
