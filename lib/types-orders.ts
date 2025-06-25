// Tipos para pedidos

// Status possíveis para um pedido
export type OrderStatus =
  | "pending" // Pendente (recebido da Plus, não enviado para Saboritte)
  | "processing" // Em processamento (enviado para Saboritte)
  | "completed" // Concluído (confirmado pela Saboritte)
  | "cancelled" // Cancelado
  | "error" // Erro no processamento

// Item de um pedido
export interface OrderItem {
  id: string
  name: string
  quantity: number
  price: number
  notes?: string
  extras?: string[]
  variation?: string
  // Campos para mapeamento
  mappedId?: string
  mappedName?: string
  mappedVariation?: string
}

// Endereço de entrega
export interface DeliveryAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  reference?: string
}

// Informações de pagamento
export interface PaymentInfo {
  method: "credit_card" | "debit_card" | "cash" | "pix" | "other"
  total: number
  change?: number
  paid: boolean
}

// Pedido completo
export interface Order {
  id: string
  clientName: string
  clientPhone?: string
  dateTime: string
  status: OrderStatus
  items: OrderItem[]
  deliveryAddress: DeliveryAddress
  paymentInfo: PaymentInfo
  notes?: string
  deliveryFee?: number
  convenienceFee?: number
  estimatedDeliveryTime?: string
  // Campos para integração
  sentToSaboritte: boolean
  saboritteSentAt?: string
  saboritteOrderId?: string
  rawDetails?: string
}

// Estatísticas de pedidos
export interface OrderStats {
  total: number
  pending: number
  processing: number
  completed: number
  cancelled: number
  error: number
  totalRevenue: number
  todayOrders: number
  todayRevenue: number
}

// Filtros para pedidos
export interface OrderFilters {
  status?: OrderStatus | "all"
  dateFrom?: string
  dateTo?: string
  clientName?: string
  minTotal?: number
  maxTotal?: number
}

// Resposta da API de pedidos
export interface OrdersApiResponse {
  pedidos: {
    id: string
    cliente: string
    dataHora: string
    status: string | null
    detalhes: string
  }[]
}

// Chave para armazenamento no localStorage
export const STORAGE_KEY_ORDERS = "intermediator_pedidos"
