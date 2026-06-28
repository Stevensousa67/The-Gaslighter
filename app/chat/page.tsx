"use client"

import { useState, useCallback, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import Link from "next/link"
import { FlameIcon, SendIcon, SquareIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(isTextUIPart)
    .map((p) => p.text)
    .join("")
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
          className="inline-block size-1.5 rounded-full bg-current opacity-50 animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  )
}

function GaslighterAvatar() {
  return (
    <Avatar>
      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
        G
      </AvatarFallback>
    </Avatar>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10">
        <FlameIcon className="size-7 text-primary" />
      </div>
      <p className="mb-2 text-base font-semibold text-foreground">
        Ready to be wrong?
      </p>
      <p className="max-w-xs text-balance text-sm text-muted-foreground">
        Say anything — a fact, an opinion, a simple hello. I&apos;ll
        respectfully and confidently explain why you&apos;re mistaken.
      </p>
    </div>
  )
}

export default function ChatPage() {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const isStreaming = status === "submitted" || status === "streaming"

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isStreaming) return
    sendMessage({ text })
    setInput("")
    textareaRef.current?.focus()
  }, [input, sendMessage, isStreaming])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      {/* Nav */}
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

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
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

      {/* Chat area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <MessageScrollerProvider>
          <MessageScroller>
            <MessageScrollerViewport>
              <MessageScrollerContent className="px-4 py-6">
                {messages.length === 0 ? (
                  <EmptyState />
                ) : (
                  <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
                    {messages.map((message) => {
                      const isUser = message.role === "user"
                      const text = getMessageText(message)

                      return (
                        <MessageScrollerItem key={message.id}>
                          <Message align={isUser ? "end" : "start"}>
                            {!isUser && (
                              <MessageAvatar>
                                <GaslighterAvatar />
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
                            </MessageContent>
                          </Message>
                        </MessageScrollerItem>
                      )
                    })}

                    {status === "submitted" && (
                      <MessageScrollerItem scrollAnchor>
                        <Message align="start">
                          <MessageAvatar>
                            <GaslighterAvatar />
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

      {/* Input */}
      <div className="shrink-0 border-t border-border/50 bg-background/80 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-2xl items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Say something. I'm sure you're wrong about it."
            className="max-h-36 min-h-[44px] flex-1 resize-none"
            disabled={isStreaming}
            rows={1}
          />
          <Button
            size="icon"
            onClick={isStreaming ? stop : handleSend}
            disabled={!isStreaming && !input.trim()}
            aria-label={isStreaming ? "Stop generation" : "Send message"}
            className="mb-0 shrink-0 self-end"
          >
            {isStreaming ? (
              <SquareIcon className="size-3.5" />
            ) : (
              <SendIcon />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-muted-foreground/60">
          <kbd className="font-mono">Enter</kbd> to send ·{" "}
          <kbd className="font-mono">Shift+Enter</kbd> for new line
        </p>
      </div>
    </div>
  )
}
