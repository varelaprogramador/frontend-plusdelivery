"use client"

import { useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

export function NotificationListener() {
  const { toast } = useToast()

  useEffect(() => {
    // Função para verificar notificações
    const checkNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        if (!response.ok) {
          console.error("Erro ao buscar notificações:", await response.text())
          return
        }

        const data = await response.json()

        // Exibir notificações não lidas
        if (data && data.notifications && data.notifications.length > 0) {
          data.notifications.forEach((notification: any) => {
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.type === "error" ? "destructive" : "default",
            })
          })

          // Marcar como lidas
          await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ids: data.notifications.map((n: any) => n.id),
            }),
          })
        }
      } catch (error) {
        console.error("Erro ao verificar notificações:", error)
      }
    }

    // Verificar notificações a cada 30 segundos
    const interval = setInterval(checkNotifications, 30000)

    // Verificar notificações imediatamente
    checkNotifications()

    return () => clearInterval(interval)
  }, [toast])

  return null
}
