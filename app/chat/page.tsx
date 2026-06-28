"use client"

import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"
import {
  FlameIcon,
  SendIcon,
  SquareIcon,
  TrophyIcon,
  SkullIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { GithubIcon } from "@/components/icons/github"
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
import { PersonaSelector, PersonaBadge } from "@/components/chat/persona-selector"
import { DisagreementMeter, computeConfidence } from "@/components/chat/disagreement-meter"
import { StarterTopics } from "@/components/chat/starter-topics"
import { CertificateModal } from "@/components/chat/certificate-modal"
import { ShareButton } from "@/components/chat/share-button"
import { type PersonaId, PERSONAS, DEFAULT_PERSONA_ID } from "@/lib/personas"

const STATS_KEY = "gaslighter_stats"

function loadStats() {
  if (typeof window === "undefined") return { totalWrong: 0, conversations: 0 }
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) ?? "{}") as {
      totalWrong?: number
      conversations?: number
    }
  } catch {
    return {}
  }
}

function saveStats(delta: { totalWrong?: number; conversations?: number }) {
  const current = loadStats()
  localStorage.setItem(
    STATS_KEY,
    JSON.stringify({
      totalWrong: (current.totalWrong ?? 0) + (delta.totalWrong ?? 0),
      conversations: (current.conversations ?? 0) + (delta.conversations ?? 0),
    }),
  )
}

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

function EmptyState({
  selectedPersona,
  onPersonaChange,
  onTopicSelect,
}: {
  selectedPersona: PersonaId
  onPersonaChange: (id: PersonaId) => void
  onTopicSelect: (text: string) => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="space-y-2">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <FlameIcon className="size-7 text-primary" />
        </div>
        <p className="text-base font-semibold text-foreground">
          Ready to be wrong?
        </p>
        <p className="max-w-xs text-balance text-sm text-muted-foreground">
          Say anything — a fact, an opinion, a simple hello. I&apos;ll
          respectfully and confidently explain why you&apos;re mistaken.
        </p>
      </div>

      <Separator className="max-w-xs" />

      <div className="w-full max-w-lg">
        <PersonaSelector
          selected={selectedPersona}
          onSelect={onPersonaChange}
        />
      </div>

      <Separator className="max-w-xs" />

      <div className="w-full max-w-lg">
        <StarterTopics onSelect={onTopicSelect} />
      </div>
    </div>
  )
}

export default function ChatPage() {
  const [input, setInput] = useState("")
  const [selectedPersona, setSelectedPersona] = useState<PersonaId>(DEFAULT_PERSONA_ID)
  const [totalWrong, setTotalWrong] = useState(0)
  const [, setTotalConversations] = useState(0)
  const [hasCountedConversation, setHasCountedConversation] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevAiCountRef = useRef(0)
  const personaRef = useRef<PersonaId>(selectedPersona)
  personaRef.current = selectedPersona

  const [transport] = useState(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ persona: personaRef.current }),
      }),
  )

  const { messages, sendMessage, status, stop } = useChat({ transport })

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

  // Load stats from localStorage on mount
  useEffect(() => {
    const stats = loadStats()
    setTotalWrong(stats.totalWrong ?? 0)
    setTotalConversations(stats.conversations ?? 0)
  }, [])

  // Count new AI messages and update localStorage stats
  useEffect(() => {
    const currentAiCount = aiMessages.length
    const delta = currentAiCount - prevAiCountRef.current
    if (delta > 0) {
      saveStats({ totalWrong: delta })
      setTotalWrong((prev) => prev + delta)
    }
    prevAiCountRef.current = currentAiCount
  }, [aiMessages.length])

  // Count this as a new conversation once we start chatting
  useEffect(() => {
    if (hasChatStarted && !hasCountedConversation) {
      saveStats({ conversations: 1 })
      setTotalConversations((prev) => prev + 1)
      setHasCountedConversation(true)
    }
  }, [hasChatStarted, hasCountedConversation])

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

  const handleTopicSelect = (text: string) => {
    doSend(text)
  }

  const handlePersonaChange = (id: PersonaId) => {
    if (hasChatStarted) {
      toast.info("Persona locked", {
        description: "Start a new conversation to switch personas.",
      })
      return
    }
    setSelectedPersona(id)
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-border/50 bg-background/80 px-4 py-2.5 backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight transition-opacity hover:opacity-80"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary">
            <FlameIcon className="size-3.5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline">The Gaslighter</span>
        </Link>

        {/* Stats badge — center */}
        {totalWrong > 0 && (
          <Badge
            variant="secondary"
            className="gap-1 text-[11px] font-medium"
          >
            <SkullIcon className="size-3 text-primary" />
            Wrong {totalWrong}× total
          </Badge>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label="Hall of Shame"
            render={<Link href="/hall-of-shame" />}
          >
            <FlameIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground"
            aria-label="Leaderboard"
            render={<Link href="/leaderboard" />}
          >
            <TrophyIcon className="size-4" />
          </Button>
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="View source on GitHub"
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
        </div>
      </header>

      {/* Disagreement meter — visible when chat has started */}
      {hasChatStarted && (
        <div className="shrink-0 border-b border-border/30 bg-background/60 px-4 py-2 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl">
            <DisagreementMeter aiMessageCount={aiMessageCount} />
          </div>
        </div>
      )}

      {/* Chat area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="px-4 py-4">
                {messages.length === 0 ? (
                  <EmptyState
                    selectedPersona={selectedPersona}
                    onPersonaChange={handlePersonaChange}
                    onTopicSelect={handleTopicSelect}
                  />
                ) : (
                  <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    {messages.map((message, i) => {
                      const isUser = message.role === "user"
                      const text = getMessageText(message)

                      // Get the matching user message for share context
                      const userMsgIndex = !isUser
                        ? userMessages.findIndex((_, ui) => {
                            const userMsgPosition = messages.findIndex(
                              (m) => m.id === userMessages[ui]?.id,
                            )
                            return userMsgPosition === i - 1
                          })
                        : -1
                      const matchingUserMsg = userMsgIndex >= 0
                        ? userMessages[userMsgIndex]
                        : userMessages[userMessages.length - 1]

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
                                    userMessage={getMessageText(matchingUserMsg)}
                                    aiResponse={text}
                                    persona={selectedPersona}
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

      {/* Input area */}
      <div className="shrink-0 border-t border-border/50 bg-background/80 px-4 pb-4 pt-3 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-2">
          {/* Persona row + certificate */}
          <div className="flex items-center justify-between gap-2">
            <PersonaBadge personaId={selectedPersona} />
            {confidence >= 80 && (
              <CertificateModal
                wrongCount={aiMessageCount}
                personaName={persona.name}
              />
            )}
          </div>

          {/* Input row */}
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
              aria-label={isStreaming ? "Stop generation" : "Send message"}
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
    </div>
  )
}
