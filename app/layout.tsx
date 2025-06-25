import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { NotificationListener } from "@/components/notification"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import SyncProgressToast from "@/components/sync-progress-toast"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Intermediator - Dashboard",
  description: "Painel de controle para gerenciamento de integrações",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-zinc-950 text-white`}>
        <ReactQueryProvider>
          <div className="flex min-h-screen">
            <aside className="fixed left-0 top-0 h-screen w-64 z-40 border-r border-zinc-800 bg-zinc-950">
              <Sidebar />
            </aside>
            <main className="flex-1 ml-64 p-6 md:p-8 overflow-auto min-h-screen">{children}</main>
          </div>
          <Toaster />
          <SyncProgressToast />
          <NotificationListener />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
