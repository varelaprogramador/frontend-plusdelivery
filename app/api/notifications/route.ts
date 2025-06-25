import { getSupabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const since = searchParams.get("since") || new Date(0).toISOString()
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10)

    const supabase = getSupabase()

    // Verificar se a tabela existe antes de consultar
    const { error: tableCheckError } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .limit(1)

    if (tableCheckError) {
      console.error("Erro ao verificar tabela de notificações:", tableCheckError)
      return NextResponse.json({
        notifications: [],
        message: "Sistema de notificações em manutenção",
      })
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select("*")
      .gt("created_at", since)
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return NextResponse.json({
      notifications: notifications || [],
    })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json(
      {
        notifications: [],
        error: "Erro ao buscar notificações",
      },
      { status: 200 },
    ) // Retornando 200 mesmo com erro para não quebrar o cliente
  }
}
