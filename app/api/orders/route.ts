import { getSupabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const clientName = searchParams.get("clientName")
    const dateFrom = searchParams.get("dateFrom")
    const dateTo = searchParams.get("dateTo")

    const supabase = getSupabase()

    let query = supabase.from("orders").select("*").order("created_at", { ascending: false })

    // Aplicar filtros
    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (clientName) {
      query = query.ilike("client_name", `%${clientName}%`)
    }

    if (dateFrom) {
      query = query.gte("date_time", dateFrom)
    }

    if (dateTo) {
      query = query.lte("date_time", dateTo)
    }

    const { data: orders, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      orders: orders || [],
      total: orders?.length || 0,
    })
  } catch (error) {
    console.error("Erro ao buscar pedidos:", error)
    return NextResponse.json({ error: "Erro ao buscar pedidos" }, { status: 500 })
  }
}
