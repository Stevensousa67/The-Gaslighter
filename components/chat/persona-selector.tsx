"use client"

import { PERSONAS, type PersonaId } from "@/lib/personas"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PersonaSelectorProps {
  selected: PersonaId
  onSelect: (id: PersonaId) => void
}

export function PersonaSelector({ selected, onSelect }: PersonaSelectorProps) {
  return (
    <div className="w-full">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Choose your adversary
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.values(PERSONAS) as (typeof PERSONAS)[PersonaId][]).map((persona) => {
          const isSelected = selected === persona.id
          return (
            <button
              key={persona.id}
              onClick={() => onSelect(persona.id)}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-center transition-all duration-150",
                "hover:border-primary/50 hover:bg-primary/5 active:scale-[0.98]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border bg-card",
              )}
              aria-pressed={isSelected}
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {persona.emoji}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold leading-tight",
                  isSelected ? "text-primary" : "text-foreground",
                )}
              >
                {persona.name}
              </span>
              <span className="text-[10px] leading-tight text-muted-foreground">
                {persona.tagline}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface PersonaBadgeProps {
  personaId: PersonaId
  className?: string
}

export function PersonaBadge({ personaId, className }: PersonaBadgeProps) {
  const persona = PERSONAS[personaId]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary",
        className,
      )}
    >
      <span aria-hidden="true">{persona.emoji}</span>
      {persona.name}
    </span>
  )
}
