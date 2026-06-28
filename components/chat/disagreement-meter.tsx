"use client"

import { cn } from "@/lib/utils"
import {
  Progress,
  ProgressTrack,
  ProgressIndicator,
} from "@/components/ui/progress"

const LEVELS = [
  { min: 0, label: "Warming up...", color: "bg-muted-foreground/50" },
  { min: 20, label: "Getting Committed", color: "bg-amber-500" },
  { min: 45, label: "Unshakeable", color: "bg-orange-500" },
  { min: 70, label: "Cosmically Certain", color: "bg-primary" },
  { min: 90, label: "BEYOND ALL REASON", color: "bg-destructive" },
]

function getLevel(value: number) {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (value >= LEVELS[i].min) return LEVELS[i]
  }
  return LEVELS[0]
}

export function computeConfidence(aiMessageCount: number): number {
  if (aiMessageCount === 0) return 0
  return Math.min(100, Math.round((aiMessageCount / 8) * 100))
}

interface DisagreementMeterProps {
  aiMessageCount: number
  className?: string
}

export function DisagreementMeter({
  aiMessageCount,
  className,
}: DisagreementMeterProps) {
  const value = computeConfidence(aiMessageCount)
  const level = getLevel(value)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Confidence
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Progress value={value} aria-label={`AI confidence: ${value}%`}>
          <ProgressTrack className="h-1.5">
            <ProgressIndicator
              className={cn("transition-all duration-500", level.color)}
            />
          </ProgressTrack>
        </Progress>
      </div>
      <span
        className={cn(
          "shrink-0 text-[10px] font-semibold transition-colors duration-300",
          value >= 90
            ? "text-destructive"
            : value >= 70
              ? "text-primary"
              : "text-muted-foreground",
        )}
      >
        {level.label}
      </span>
    </div>
  )
}
