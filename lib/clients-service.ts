import { getSupabase } from "./supabase"
import { normalizePhoneNumber } from "./utils"

// Tipo para cliente
export type Cliente = {
  id: number
  nome: string
  telefone: string
  endereco?: string
  bairro?: string
  cidade?: string
  estado?: string
  observacoes?: string
  ultimoPedido?: string
  totalPedidos?: number
  valorTotal?: number
  createdAt?: string
  updatedAt?: string
}

// Tipo para filtros de cliente
export type ClienteFilters = {
  nome?: string
  telefone?: string
  bairro?: string
  cidade?: string
  estado?: string
  dataInicio?: string
  dataFim?: string
}

// Classe para gerenciar clientes
export class ClientsService {
  // Buscar todos os clientes do Supabase
  static async getClientes(filters?: ClienteFilters): Promise<Cliente[]> {
    try {
      const supabase = getSupabase()
      let query = supabase.from("clients").select("*")

      // Aplicar filtros se fornecidos
      if (filters) {
        if (filters.nome) {
          query = query.ilike("nome", `%${filters.nome}%`)
        }

        if (filters.telefone) {
          // Normalizar o telefone do filtro
          const normalizedPhone = normalizePhoneNumber(filters.telefone)

          // Buscar todos os clientes e filtrar pelo telefone normalizado
          const { data: allClients } = await supabase.from("clients").select("*")

          if (allClients) {
            // Filtrar manualmente os clientes cujo telefone normalizado contém o telefone normalizado do filtro
            const filteredClients = allClients.filter((cliente) =>
              normalizePhoneNumber(cliente.telefone).includes(normalizedPhone),
            )

            return filteredClients
          }

          return []
        }

        if (filters.bairro) {
          query = query.ilike("bairro", `%${filters.bairro}%`)
        }

        if (filters.cidade) {
          query = query.ilike("cidade", `%${filters.cidade}%`)
        }

        if (filters.estado) {
          query = query.ilike("estado", `%${filters.estado}%`)
        }

        if (filters.dataInicio) {
          query = query.gte("createdAt", filters.dataInicio)
        }

        if (filters.dataFim) {
          query = query.lte("createdAt", filters.dataFim)
        }
      }

      const { data, error } = await query.order("nome", { ascending: true })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
      return []
    }
  }

  // Buscar um cliente específico por ID
  static async getClienteById(id: number): Promise<Cliente | null> {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("clients").select("*").eq("id", id).single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error(`Erro ao buscar cliente com ID ${id}:`, error)
      return null
    }
  }

  // Buscar um cliente pelo telefone normalizado
  static async getClienteByPhone(phone: string): Promise<Cliente | null> {
    if (!phone) return null

    try {
      const normalizedPhone = normalizePhoneNumber(phone)
      if (normalizedPhone.length < 8) return null // Número muito curto, provavelmente inválido

      const supabase = getSupabase()

      // Buscar todos os clientes
      const { data: clientes, error } = await supabase.from("clients").select("*")

      if (error) throw error
      if (!clientes || clientes.length === 0) return null

      // Encontrar o cliente com o mesmo número normalizado
      const clienteEncontrado = clientes.find((cliente) => normalizePhoneNumber(cliente.telefone) === normalizedPhone)

      return clienteEncontrado || null
    } catch (error) {
      console.error("Erro ao buscar cliente por telefone:", error)
      return null
    }
  }

  // Salvar um cliente no Supabase
  static async salvarCliente(
    cliente: Omit<Cliente, "id">,
  ): Promise<{ success: boolean; message: string; cliente?: Cliente }> {
    try {
      // Normalizar o telefone antes de salvar
      const telefoneNormalizado = normalizePhoneNumber(cliente.telefone)

      // Verificar se já existe um cliente com este telefone
      const clienteExistente = await this.getClienteByPhone(cliente.telefone)

      if (clienteExistente) {
        return {
          success: false,
          message: `Cliente com telefone ${cliente.telefone} já existe no sistema.`,
          cliente: clienteExistente,
        }
      }

      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...cliente, telefone: telefoneNormalizado })
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: "Cliente salvo com sucesso!",
        cliente: data,
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  }

  // Atualizar um cliente no Supabase
  static async atualizarCliente(
    id: number,
    cliente: Partial<Cliente>,
  ): Promise<{ success: boolean; message: string; cliente?: Cliente }> {
    try {
      // Se o telefone foi atualizado, normalizar
      if (cliente.telefone) {
        cliente.telefone = normalizePhoneNumber(cliente.telefone)
      }

      const supabase = getSupabase()
      const { data, error } = await supabase
        .from("clients")
        .update({ ...cliente, updatedAt: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return {
        success: true,
        message: "Cliente atualizado com sucesso!",
        cliente: data,
      }
    } catch (error) {
      console.error(`Erro ao atualizar cliente com ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  }

  // Excluir um cliente do Supabase
  static async excluirCliente(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = getSupabase()
      const { error } = await supabase.from("clients").delete().eq("id", id)

      if (error) {
        throw error
      }

      return {
        success: true,
        message: "Cliente excluído com sucesso!",
      }
    } catch (error) {
      console.error(`Erro ao excluir cliente com ID ${id}:`, error)
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      }
    }
  }
}
