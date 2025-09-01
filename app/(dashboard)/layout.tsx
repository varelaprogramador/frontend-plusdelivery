import type React from "react"

import "../globals.css"
import { Sidebar } from "@/components/sidebar"
import { NotificationListener } from "@/components/notification"
import SyncProgressToast from "@/components/sync-progress-toast"
import { Toaster } from "@/components/ui/sonner"


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 h-screen w-64 z-40 border-r border-zinc-800 bg-zinc-950">
          <Sidebar />
        </aside>
        <main className="flex-1 ml-64 p-6 md:p-8 overflow-auto min-h-screen">{children}</main>
      </div>
      <Toaster />
      <SyncProgressToast />
      <NotificationListener />
    </>
  )
}
