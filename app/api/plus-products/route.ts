import { getSupabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabase()

    // Buscar produtos
    const { data: produtos, error } = await supabase
      .from("plus_products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Buscar a última sincronização
    const { data: config } = await supabase.from("config").select("value").eq("key", "last_plus_sync").single()

    return NextResponse.json({
      produtos: produtos || [],
      totalProdutos: produtos?.length || 0,
      ultimaSincronizacao: config?.value || null,
    })
  } catch (error) {
    console.error("Erro ao buscar produtos Plus:", error)
    return NextResponse.json({ error: "Erro ao buscar produtos" }, { status: 500 })
  }
}
