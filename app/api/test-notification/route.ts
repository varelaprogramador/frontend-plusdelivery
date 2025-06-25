import { createNotification } from "@/lib/notifications"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const types = ["success", "error", "info"] as const
    const type = types[Math.floor(Math.random() * types.length)]

    const notification = await createNotification({
      title: `Notificação de teste (${type})`,
      message: `Esta é uma notificação de teste do tipo ${type} gerada em ${new Date().toLocaleString("pt-BR")}`,
      type,
    })

    return NextResponse.json({
      success: true,
      message: "Notificação de teste criada com sucesso",
      notification,
    })
  } catch (error) {
    console.error("Erro ao criar notificação de teste:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao criar notificação de teste",
      },
      { status: 500 },
    )
  }
}
