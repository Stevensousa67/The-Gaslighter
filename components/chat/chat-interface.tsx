"use client"

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"
import {
  FlameIcon,
  SendIcon,
  SquareIcon,
  SkullIcon,
  LogInIcon,
  ClipboardListIcon,
  XIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { GithubIcon } from "@/components/icons/github"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from "@/components/ui/message-scroller"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  PersonaSelector,
  PersonaBadge,
} from "@/components/chat/persona-selector"
import {
  DisagreementMeter,
  computeConfidence,
} from "@/components/chat/disagreement-meter"
import { StarterTopics } from "@/components/chat/starter-topics"
import { CertificateModal } from "@/components/chat/certificate-modal"
import { ShareButton } from "@/components/chat/share-button"
import { ReportCard } from "@/components/chat/report-card"
import { useAchievementUnlocker } from "@/components/chat/achievement-toast"
import { authClient } from "@/lib/auth-client"
import {
  type PersonaId,
  PERSONAS,
  DEFAULT_PERSONA_ID,
} from "@/lib/personas"
import { CONVERSATION_CREATED_EVENT } from "@/components/chat/app-sidebar"

// ─── helpers ─────────────────────────────────────────────────────────────────

function getMessageText(message: UIMessage): string {
  return message.parts.filter(isTextUIPart).map((p) => p.text).join("")
}

function MarkdownContent({ text }: { text: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>
        ),
        li: ({ children }) => <li className="mb-0.5">{children}</li>,
        strong: ({ children }) => (
          <strong className="font-semibold">{children}</strong>
        ),
        em: ({ children }) => <em className="italic">{children}</em>,
        code: ({ children }) => (
          <code className="rounded bg-black/10 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
            {children}
          </code>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-primary underline underline-offset-2 hover:no-underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {children}
          </a>
        ),
      }}
    >
      {text}
    </ReactMarkdown>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="inline-block size-1.5 animate-bounce rounded-full bg-current opacity-50"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

function GaslighterAvatar({ emoji }: { emoji: string }) {
  return (
    <Avatar>
      <AvatarFallback className="bg-primary text-base text-primary-foreground">
        {emoji}
      </AvatarFallback>
    </Avatar>
  )
}

// ─── empty state ─────────────────────────────────────────────────────────────

function EmptyState({
  selectedPersona,
  onPersonaChange,
  onTopicSelect,
  initialClaim,
}: {
  selectedPersona: PersonaId
  onPersonaChange: (id: PersonaId) => void
  onTopicSelect: (text: string) => void
  initialClaim: string | null
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 text-center">
      {initialClaim ? (
        <div className="space-y-2">
          <Badge variant="secondary" className="gap-1.5">
            <FlameIcon className="size-3 text-primary" />
            Daily Challenge
          </Badge>
          <p className="max-w-sm text-balance text-lg font-semibold">
            Defend this claim:
          </p>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 px-6 py-4">
            <p className="text-base font-medium text-foreground">
              &ldquo;{initialClaim}&rdquo;
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Choose a persona below, then hit Send.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
            <FlameIcon className="size-7 text-primary" />
          </div>
          <p className="text-base font-semibold">Ready to be wrong?</p>
          <p className="max-w-xs text-balance text-sm text-muted-foreground">
            Say anything — a fact, an opinion, a hello. I&apos;ll respectfully
            and confidently explain why you&apos;re mistaken.
          </p>
        </div>
      )}

      <Separator className="max-w-xs" />

      <div className="w-full max-w-lg">
        <PersonaSelector selected={selectedPersona} onSelect={onPersonaChange} />
      </div>

      {!initialClaim && (
        <>
          <Separator className="max-w-xs" />
          <div className="w-full max-w-lg">
            <StarterTopics onSelect={onTopicSelect} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── sign-in nudge banner ─────────────────────────────────────────────────────

function SignInNudge({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-primary/5 px-4 py-2.5">
      <div className="flex items-center gap-2 text-sm">
        <LogInIcon className="size-3.5 shrink-0 text-primary" />
        <span className="text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary underline underline-offset-2 hover:no-underline"
          >
            Sign in
          </Link>{" "}
          to save your conversation history.
        </span>
      </div>
      <button
        onClick={onDismiss}
        className="shrink-0 text-muted-foreground/60 transition-colors hover:text-muted-foreground"
        aria-label="Dismiss"
      >
        <XIcon className="size-3.5" />
      </button>
    </div>
  )
}

// ─── main component ───────────────────────────────────────────────────────────

interface ChatInterfaceProps {
  initialMessages: UIMessage[]
  initialConversationId: string | null
  initialPersona: PersonaId
  initialClaim: string | null
  isLoggedIn: boolean
  userName: string | null
}

export function ChatInterface({
  initialMessages,
  initialConversationId,
  initialPersona,
  initialClaim,
  isLoggedIn,
}: ChatInterfaceProps) {
  const [input, setInput] = useState(initialClaim ?? "")
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(initialPersona)
  const [showNudge, setShowNudge] = useState(!isLoggedIn)
  const [showReportCard, setShowReportCard] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const personaRef = useRef<PersonaId>(selectedPersona)
  personaRef.current = selectedPersona

  const conversationIdRef = useRef<string | null>(initialConversationId)
  const savedCountRef = useRef(initialMessages.length)
  const hasCountedConversationRef = useRef(!!initialConversationId)

  // Session from client for live updates
  const { data: session } = authClient.useSession()
  const effectivelyLoggedIn = isLoggedIn || !!session
  const { unlock } = useAchievementUnlocker({ session: session ?? null })

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ persona: personaRef.current }),
      }),
  )

  const { messages, sendMessage, status, stop } = useChat({
    transport,
    messages: initialMessages,
  })

  const isStreaming = status === "submitted" || status === "streaming"
  const aiMessages = useMemo(
    () => messages.filter((m) => m.role === "assistant"),
    [messages],
  )
  const userMessages = useMemo(
    () => messages.filter((m) => m.role === "user"),
    [messages],
  )
  const aiMessageCount = aiMessages.length
  const confidence = computeConfidence(aiMessageCount)
  const hasChatStarted = messages.length > 0
  const persona = PERSONAS[selectedPersona]

  // ── Save conversation to DB when logged in ─────────────────────────────────
  useEffect(() => {
    if (status !== "ready" || !effectivelyLoggedIn) return
    const unsaved = messages.slice(savedCountRef.current)
    if (unsaved.length === 0) return

    const save = async () => {
      // Create conversation on first save
      if (!conversationIdRef.current) {
        const firstUserMsg = messages.find((m) => m.role === "user")
        const title = firstUserMsg
          ? getMessageText(firstUserMsg).slice(0, 60)
          : "New conversation"

        try {
          const res = await fetch("/api/conversations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ persona: personaRef.current, title }),
          })
          if (!res.ok) return
          const conv = await res.json()
          conversationIdRef.current = conv.id
          window.history.replaceState({}, "", `/chat?c=${conv.id}`)
          window.dispatchEvent(new CustomEvent(CONVERSATION_CREATED_EVENT))
        } catch {
          return
        }
      }

      const convId = conversationIdRef.current!
      for (const msg of unsaved) {
        const text = getMessageText(msg)
        if (!text) continue
        try {
          await fetch(`/api/conversations/${convId}/messages`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: msg.role, content: text }),
          })
        } catch {
          // fail silently — don't interrupt the UX
        }
      }
      savedCountRef.current = messages.length
    }

    save()
  }, [status, effectivelyLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Achievement unlocking ──────────────────────────────────────────────────
  useEffect(() => {
    if (!effectivelyLoggedIn) return
    if (aiMessageCount === 1) unlock("first_blood")
    if (aiMessageCount === 3) unlock("triple_threat")
    if (aiMessageCount === 10) unlock("wrong_ten")
    if (confidence >= 80) unlock("certificate_earned")
  }, [aiMessageCount, effectivelyLoggedIn]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send ───────────────────────────────────────────────────────────────────
  const doSend = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return
      sendMessage({ text: trimmed })
      setInput("")
      textareaRef.current?.focus()
    },
    [sendMessage, isStreaming],
  )

  const handleSend = useCallback(() => doSend(input), [doSend, input])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handlePersonaChange = (id: PersonaId) => {
    if (hasChatStarted) {
      toast.info("Persona locked for this conversation.")
      return
    }
    setSelectedPersona(id)
  }

  // Most recent AI response for report card
  const latestAiText = aiMessages.length > 0
    ? getMessageText(aiMessages[aiMessages.length - 1])
    : undefined

  return (
    <div className="flex h-dvh flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-3 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <SidebarTrigger className="size-8 text-muted-foreground" />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
          >
            <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-primary">
              <FlameIcon className="size-3 text-primary-foreground" />
            </div>
            <span className="hidden sm:inline">The Gaslighter</span>
          </Link>
        </div>

        {/* Wrong count badge */}
        {aiMessageCount > 0 && (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            <SkullIcon className="size-3 text-primary" />
            Wrong {aiMessageCount}×
          </Badge>
        )}

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="GitHub"
            render={
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" />
            }
          >
            <GithubIcon className="size-4" />
          </Button>
        </div>
      </header>

      {/* ── Sign-in nudge ────────────────────────────────────────────────── */}
      {showNudge && hasChatStarted && !effectivelyLoggedIn && (
        <SignInNudge onDismiss={() => setShowNudge(false)} />
      )}

      {/* ── Disagreement meter ───────────────────────────────────────────── */}
      {hasChatStarted && (
        <div className="shrink-0 border-b border-border/30 bg-background/60 px-4 py-2 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl">
            <DisagreementMeter aiMessageCount={aiMessageCount} />
          </div>
        </div>
      )}

      {/* ── Chat area ────────────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="px-4 py-4">
                {messages.length === 0 ? (
                  <EmptyState
                    selectedPersona={selectedPersona}
                    onPersonaChange={handlePersonaChange}
                    onTopicSelect={doSend}
                    initialClaim={initialClaim}
                  />
                ) : (
                  <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    {messages.map((message, i) => {
                      const isUser = message.role === "user"
                      const text = getMessageText(message)
                      // Match with previous user message for share context
                      const prevUserMsg =
                        !isUser && i > 0
                          ? messages
                              .slice(0, i)
                              .reverse()
                              .find((m) => m.role === "user")
                          : undefined

                      return (
                        <MessageScrollerItem key={message.id}>
                          <Message align={isUser ? "end" : "start"}>
                            {!isUser && (
                              <MessageAvatar>
                                <GaslighterAvatar emoji={persona.emoji} />
                              </MessageAvatar>
                            )}
                            <MessageContent>
                              <Bubble
                                variant={isUser ? "default" : "muted"}
                                align={isUser ? "end" : "start"}
                              >
                                <BubbleContent>
                                  {isUser ? (
                                    text
                                  ) : (
                                    <MarkdownContent text={text} />
                                  )}
                                </BubbleContent>
                              </Bubble>
                              {!isUser && text && (
                                <div className="mt-0.5 flex justify-start pl-1">
                                  <ShareButton
                                    userMessage={
                                      prevUserMsg
                                        ? getMessageText(prevUserMsg)
                                        : ""
                                    }
                                    aiResponse={text}
                                    persona={selectedPersona}
                                    onShared={() => unlock("hall_of_shamer")}
                                  />
                                </div>
                              )}
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      )
                    })}

                    {status === "submitted" && (
                      <MessageScrollerItem scrollAnchor>
                        <Message align="start">
                          <MessageAvatar>
                            <GaslighterAvatar emoji={persona.emoji} />
                          </MessageAvatar>
                          <MessageContent>
                            <Bubble variant="muted" align="start">
                              <BubbleContent>
                                <TypingIndicator />
                              </BubbleContent>
                            </Bubble>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )}
                  </div>
                )}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      </div>

      {/* ── Input area ───────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border/50 bg-background/80 px-4 pb-4 pt-3 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
          {/* Persona badge + action buttons row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PersonaBadge personaId={selectedPersona} />
            <div className="flex items-center gap-1.5">
              {aiMessageCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 gap-1.5 px-2 text-[11px] text-muted-foreground"
                  onClick={() => setShowReportCard(true)}
                >
                  <ClipboardListIcon className="size-3" />
                  Report Card
                </Button>
              )}
              {confidence >= 80 && (
                <CertificateModal
                  wrongCount={aiMessageCount}
                  personaName={persona.name}
                />
              )}
            </div>
          </div>

          {/* Input + send row */}
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Say something. I'm sure you're wrong about it."
              className="max-h-36 min-h-11 flex-1 resize-none"
              disabled={isStreaming}
              rows={1}
            />
            <Button
              size="icon"
              onClick={isStreaming ? stop : handleSend}
              disabled={!isStreaming && !input.trim()}
              aria-label={isStreaming ? "Stop" : "Send"}
              className="shrink-0 self-end"
            >
              {isStreaming ? (
                <SquareIcon className="size-3.5" />
              ) : (
                <SendIcon />
              )}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground/50">
            <kbd className="font-mono">Enter</kbd> to send ·{" "}
            <kbd className="font-mono">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>

      {/* ── Report Card modal ──────────────────────────────────────────────── */}
      <ReportCard
        open={showReportCard}
        onOpenChange={setShowReportCard}
        wrongCount={aiMessageCount}
        totalMessages={messages.length}
        personaName={persona.name}
        personaEmoji={persona.emoji}
        bestQuote={latestAiText}
      />
    </div>
  )
}
