import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { NotificationListener } from "@/components/notification"
import { ReactQueryProvider } from "@/lib/react-query-provider"
import SyncProgressToast from "@/components/sync-progress-toast"
import { Toaster } from "@/components/ui/sonner"
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Intermediator - Dashboard",
    description: "Painel de controle para gerenciamento de integrações",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <ClerkProvider>
            <html lang="pt-BR">
                <body className={`${inter.className} bg-zinc-950 text-white`}>
                    <ReactQueryProvider>

                        {children}

                    </ReactQueryProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
