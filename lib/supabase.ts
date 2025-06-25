import { createClient } from "@supabase/supabase-js"

// Tipos para as vinculações de produtos no Supabase
export interface ProductLinkRow {
  id: number
  plus_id: string
  plus_name: string
  plus_category: string
  plus_price: string
  plus_promo_price: string
  plus_enabled: boolean
  saboritte_id: string
  saboritte_name: string
  saboritte_category: string
  saboritte_price: string
  saboritte_enabled: boolean
  saboritte_image: string | null
  variation_description: string | null
  variation_price: string | null
  created_at: string
  updated_at: string
}

// Update the ClientRow interface to match the database column names (lowercase)
export interface ClientRow {
  id: string
  nome: string
  telefone: string
  bloqueado: boolean
  permitirrobo: boolean // Changed from permitirRobo to match DB column
  permitircampanhas: boolean // Changed from permitirCampanhas to match DB column
  created_at?: string
  updated_at?: string
}

// Criação do cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Singleton pattern para o cliente Supabase
let supabaseInstance: ReturnType<typeof createClient> | null = null

export const getSupabase = () => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseInstance
}
