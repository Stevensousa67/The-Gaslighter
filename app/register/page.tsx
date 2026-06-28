"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FlameIcon, EyeIcon, EyeOffIcon, Loader2Icon, ArrowLeftIcon } from "lucide-react"

import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GithubIcon } from "@/components/icons/github"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isGithubPending, setIsGithubPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsPending(true)

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/chat",
      })

      if (result.error) {
        setError(result.error.message ?? "Failed to create account. Please try again.")
      } else {
        router.push("/chat")
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setIsPending(false)
    }
  }

  async function handleGithubSignIn() {
    setError(null)
    setIsGithubPending(true)

    try {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/chat",
      })
    } catch {
      setError("GitHub sign in failed. Please try again.")
      setIsGithubPending(false)
    }
  }

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Left branding panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:bg-primary lg:px-12 lg:text-primary-foreground">
        <div className="flex max-w-sm flex-col items-center gap-6 text-center">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-primary-foreground/10">
            <FlameIcon className="size-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">The Gaslighter</h1>
            <p className="text-xl font-medium text-primary-foreground/80">
              Join the argument.
            </p>
          </div>
          <p className="text-sm text-primary-foreground/60 text-balance leading-relaxed">
            You&apos;ll lose. Gloriously.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 lg:px-8">
        {/* Back link */}
        <div className="w-full max-w-sm mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground"
            render={<Link href="/" />}
            nativeButton={false}
          >
            <ArrowLeftIcon className="size-4" />
            Back to home
          </Button>
        </div>

        {/* Mobile branding */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center lg:hidden">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary">
            <FlameIcon className="size-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Join the argument. You&apos;ll lose. Gloriously.</p>
        </div>

        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Create an account</CardTitle>
            <CardDescription>Start your record of wrongness today</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* GitHub OAuth */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleGithubSignIn}
              disabled={isGithubPending || isPending}
            >
              {isGithubPending ? (
                <Loader2Icon className="size-4 animate-spin" />
              ) : (
                <GithubIcon className="size-4" />
              )}
              Continue with GitHub
            </Button>

            {/* Divider */}
            <div className="relative flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Or continue with
              </span>
              <Separator className="flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  disabled={isPending || isGithubPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isPending || isGithubPending}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isPending || isGithubPending}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOffIcon className="size-4" />
                    ) : (
                      <EyeIcon className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isPending || isGithubPending}
              >
                {isPending && <Loader2Icon className="size-4 animate-spin" />}
                {isPending ? "Creating account…" : "Create account"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex-col gap-2 text-center text-sm text-muted-foreground">
            <span>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
