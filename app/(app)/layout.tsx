import { Suspense } from "react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/chat/app-sidebar"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider defaultOpen>
      <Suspense>
        <AppSidebar />
      </Suspense>
      <SidebarInset className="min-w-0">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
