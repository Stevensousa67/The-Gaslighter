"use client"

import { toast } from "sonner"
import { getAchievement } from "@/lib/achievements"

export function triggerAchievementToast(key: string) {
  const achievement = getAchievement(key)
  if (!achievement) return
  toast(`${achievement.emoji} Achievement Unlocked!`, {
    description: `${achievement.name} — ${achievement.description}`,
    duration: 5000,
  })
}

export function useAchievementUnlocker(options: {
  session: { user: { id: string } } | null
}) {
  const unlock = async (key: string) => {
    if (!options.session) return // only for logged-in users

    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementKey: key }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.newly_unlocked) {
          triggerAchievementToast(key)
        }
      }
    } catch {
      // silently ignore network errors
    }
  }

  return { unlock }
}
