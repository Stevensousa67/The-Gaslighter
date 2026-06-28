"use client"

import { Button } from "@/components/ui/button"

const STARTER_TOPICS = [
  "The sky is blue.",
  "Water is wet.",
  "Pizza is delicious.",
  "The Earth is round.",
  "Exercise is good for you.",
  "Dogs make great pets.",
  "Reading is beneficial.",
  "Sleep is important for health.",
  "The sun rises in the east.",
  "Two plus two equals four.",
  "Chocolate tastes good.",
  "Gravity pulls things downward.",
]

interface StarterTopicsProps {
  onSelect: (text: string) => void
}

export function StarterTopics({ onSelect }: StarterTopicsProps) {
  return (
    <div className="w-full">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
        Start with a bold claim
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {STARTER_TOPICS.map((topic) => (
          <Button
            key={topic}
            variant="outline"
            className="h-auto rounded-full px-4 py-2 text-xs font-medium"
            onClick={() => onSelect(topic)}
          >
            {topic}
          </Button>
        ))}
      </div>
    </div>
  )
}
