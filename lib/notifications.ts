import { getSupabase } from "./supabase"

interface NotificationData {
  title: string
  message: string
  type: "success" | "error" | "info"
}

/**
 * Cria uma nova notificação no banco de dados
 */
export async function createNotification(data: NotificationData) {
  try {
    const supabase = getSupabase()

    const { error } = await supabase.from("notifications").insert({
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Erro ao criar notificação:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
    return false
  }
}

/**
 * Busca notificações não lidas
 */
export async function getUnreadNotifications() {
  try {
    const supabase = getSupabase()

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("read", false)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) {
      console.error("Erro ao buscar notificações:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return []
  }
}

/**
 * Marca uma notificação como lida
 */
export async function markNotificationAsRead(id: string) {
  try {
    const supabase = getSupabase()

    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro ao marcar notificação como lida:", error)
    return false
  }
}

/**
 * Marca todas as notificações como lidas
 */
export async function markAllNotificationsAsRead() {
  try {
    const supabase = getSupabase()

    const { error } = await supabase
      .from("notifications")
      .update({ read: true, updated_at: new Date().toISOString() })
      .eq("read", false)

    if (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Erro ao marcar todas as notificações como lidas:", error)
    return false
  }
}
