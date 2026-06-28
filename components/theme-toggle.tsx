"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon data-icon className="scale-100 dark:scale-0 transition-transform duration-300" />
      <MoonIcon data-icon className="absolute scale-0 dark:scale-100 transition-transform duration-300" />
    </Button>
  )
}
