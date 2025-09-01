import type React from "react"

import "../globals.css"
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
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
      <div className="min-h-screen bg-zinc-950">
        {/* Mobile header - only visible on mobile */}
        <MobileHeader />
        
        <div className="flex">
          {/* Sidebar - Hidden on mobile, fixed on desktop */}
          <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:z-40 lg:border-r lg:border-zinc-800 lg:bg-zinc-950 lg:block">
            <Sidebar />
          </aside>
          
          {/* Main content - Full width on mobile, with left margin on desktop */}
          <main className="flex-1 lg:ml-64 w-full min-h-screen">
            <div className="p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
      <SyncProgressToast />
      <NotificationListener />
    </>
  )
}
