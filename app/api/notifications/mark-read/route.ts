import { getSupabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "IDs de notificação inválidos",
        },
        { status: 400 },
      )
    }

    const supabase = getSupabase()

    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .in("id", ids)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: `${ids.length} notificação(ões) marcada(s) como lida(s)`,
    })
  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao marcar notificações como lidas",
      },
      { status: 500 },
    )
  }
}
