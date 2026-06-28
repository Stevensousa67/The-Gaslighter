"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import {
  FlameIcon,
  PlusIcon,
  Trash2Icon,
  MessageSquareIcon,
  TrophyIcon,
  SkullIcon,
  UserIcon,
  LogInIcon,
  CalendarIcon,
  SparklesIcon,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { authClient } from "@/lib/auth-client"
import { PERSONAS, type PersonaId } from "@/lib/personas"
import { cn } from "@/lib/utils"

export const CONVERSATION_CREATED_EVENT = "gaslighter:conversation-created"

type Conversation = {
  id: string
  title: string
  persona: string
  wrongCount: number
  messageCount: number
  updatedAt: string
}

function groupConversations(conversations: Conversation[]) {
  const now = new Date()
  const todayStr = now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toDateString()
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const groups: { label: string; items: Conversation[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This Week", items: [] },
    { label: "Older", items: [] },
  ]

  for (const conv of conversations) {
    const d = new Date(conv.updatedAt)
    if (d.toDateString() === todayStr) groups[0].items.push(conv)
    else if (d.toDateString() === yesterdayStr) groups[1].items.push(conv)
    else if (d >= weekAgo) groups[2].items.push(conv)
    else groups[3].items.push(conv)
  }

  return groups.filter((g) => g.items.length > 0)
}

export function AppSidebar() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const searchParams = useSearchParams()
  const activeConversationId = searchParams.get("c")
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    if (!session) { setConversations([]); return }
    setIsLoading(true)
    try {
      const res = await fetch("/api/conversations")
      if (res.ok) setConversations(await res.json())
    } catch {
      // silent
    } finally {
      setIsLoading(false)
    }
  }, [session])

  // Load on mount and when session changes
  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  // Refresh when a new conversation is saved by ChatInterface
  useEffect(() => {
    const handler = () => loadConversations()
    window.addEventListener(CONVERSATION_CREATED_EVENT, handler)
    return () => window.removeEventListener(CONVERSATION_CREATED_EVENT, handler)
  }, [loadConversations])

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    e.preventDefault()
    setDeletingId(id)
    try {
      await fetch(`/api/conversations/${id}`, { method: "DELETE" })
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (id === activeConversationId) router.push("/chat")
    } finally {
      setDeletingId(null)
    }
  }

  const grouped = groupConversations(conversations)
  const user = session?.user

  return (
    <Sidebar collapsible="offcanvas">
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border/50 pb-3">
        <Link
          href="/"
          className="flex items-center gap-2 px-1 py-1 transition-opacity hover:opacity-80"
        >
          <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary">
            <FlameIcon className="size-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold tracking-tight">The Gaslighter</span>
        </Link>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-sm"
          render={<Link href="/chat" />}
        >
          <PlusIcon className="size-4" />
          New Argument
        </Button>
      </SidebarHeader>

      {/* Conversations */}
      <SidebarContent>
        {sessionPending ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : !session ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-3 py-6 text-center">
                <MessageSquareIcon className="mx-auto mb-3 size-8 text-muted-foreground/30" />
                <p className="mb-1 text-sm font-medium">Save your arguments</p>
                <p className="mb-4 text-xs text-muted-foreground">
                  Sign in to keep a history of all your losing debates.
                </p>
                <Button size="sm" className="w-full gap-2" render={<Link href="/login" />}>
                  <LogInIcon className="size-3.5" />
                  Sign In
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : isLoading ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuSkeleton />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : grouped.length === 0 ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="px-3 py-6 text-center">
                <SparklesIcon className="mx-auto mb-3 size-8 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">
                  No arguments yet. Start one!
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          grouped.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((conv) => {
                    const isActive = conv.id === activeConversationId
                    const persona = PERSONAS[conv.persona as PersonaId]
                    return (
                      <SidebarMenuItem key={conv.id}>
                        <SidebarMenuButton
                          isActive={isActive}
                          render={<Link href={`/chat?c=${conv.id}`} />}
                          className="group/item h-auto py-2"
                        >
                          <span className="shrink-0 text-base leading-none">
                            {persona?.emoji ?? "💬"}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium">
                              {conv.title}
                            </span>
                            {conv.wrongCount > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                Wrong {conv.wrongCount}×
                              </span>
                            )}
                          </div>
                        </SidebarMenuButton>
                        <SidebarMenuAction
                          onClick={(e) => handleDelete(e, conv.id)}
                          aria-label="Delete conversation"
                          showOnHover
                        >
                          <Trash2Icon className="size-3.5" />
                        </SidebarMenuAction>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))
        )}
      </SidebarContent>

      {/* Footer nav + user */}
      <SidebarFooter className="border-t border-sidebar-border/50 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/daily" />} className="gap-2">
              <CalendarIcon className="size-4" />
              <span>Daily Challenge</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/hall-of-shame" />} className="gap-2">
              <SkullIcon className="size-4" />
              <span>Hall of Shame</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/leaderboard" />} className="gap-2">
              <TrophyIcon className="size-4" />
              <span>Leaderboard</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        {!sessionPending && (
          session ? (
            <SidebarMenuButton render={<Link href="/profile" />} className="h-auto gap-3 py-2">
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="bg-primary/20 text-[10px] font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium">{user?.name}</span>
                <span className="truncate text-[10px] text-muted-foreground">
                  View profile
                </span>
              </div>
            </SidebarMenuButton>
          ) : (
            <SidebarMenuButton render={<Link href="/login" />} className="gap-2">
              <LogInIcon className="size-4" />
              <span>Sign In</span>
            </SidebarMenuButton>
          )
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
