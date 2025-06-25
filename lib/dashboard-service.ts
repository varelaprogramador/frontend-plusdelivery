import { getSupabase } from "./supabase"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export type DashboardStats = {
  totalPedidos: number
  pedidosEnviados: number
  pedidosPendentes: number
  ultimaSincronizacao: {
    data: string
    tempoAtras: string
    tipo: string
    status: string
  }
  produtosVinculados: number
  clientesCadastrados: number
  clientesAtivos: number
  atividadesRecentes: Array<{
    id: string
    tipo: string
    descricao: string
    tempoAtras: string
    icone: string
  }>
  statusSistema: {
    apiPlusDelivery: boolean
    apiSaboritte: boolean
    servicoSincronizacao: boolean
    bancoDados: boolean
    usoMemoria: number
  }
  taxasSucesso: {
    pedidos: number
    produtos: number
    clientes: number
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabase()

  // Buscar contagem de pedidos
  const { count: totalPedidos } = await supabase.from("orders").select("*", { count: "exact", head: true })

  // Buscar contagem de pedidos enviados
  const { count: pedidosEnviados } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "enviado")

  // Buscar contagem de pedidos pendentes
  const { count: pedidosPendentes } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente")

  // Buscar última sincronização
  const { data: ultimaSincronizacaoData } = await supabase
    .from("sync_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)

  // Buscar contagem de produtos vinculados
  const { count: produtosVinculados } = await supabase.from("product_links").select("*", { count: "exact", head: true })

  // Buscar contagem de clientes
  const { count: clientesCadastrados } = await supabase.from("clients").select("*", { count: "exact", head: true })

  // Buscar contagem de clientes ativos (não bloqueados)
  const { count: clientesAtivos } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("bloqueado", false)

  // Buscar atividades recentes
  const { data: atividadesRecentesData } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  // Calcular taxas de sucesso
  const taxasSucesso = await calcularTaxasSucesso(supabase)

  // Formatar última sincronização
  const ultimaSincronizacao = ultimaSincronizacaoData?.[0]
    ? {
        data: new Date(ultimaSincronizacaoData[0].created_at).toLocaleString("pt-BR"),
        tempoAtras: formatDistanceToNow(new Date(ultimaSincronizacaoData[0].created_at), {
          addSuffix: true,
          locale: ptBR,
        }),
        tipo: ultimaSincronizacaoData[0].type || "N/A",
        status: ultimaSincronizacaoData[0].status || "N/A",
      }
    : {
        data: "Nunca",
        tempoAtras: "Nunca",
        tipo: "N/A",
        status: "N/A",
      }

  // Formatar atividades recentes
  const atividadesRecentes = atividadesRecentesData
    ? atividadesRecentesData.map((atividade) => ({
        id: atividade.id,
        tipo: atividade.type,
        descricao: atividade.description,
        tempoAtras: formatDistanceToNow(new Date(atividade.created_at), {
          addSuffix: true,
          locale: ptBR,
        }),
        icone: getIconeAtividade(atividade.type),
      }))
    : []

  // Verificar status do sistema (conexões com APIs e banco de dados)
  const statusSistema = await verificarStatusSistema()

  return {
    totalPedidos: totalPedidos || 0,
    pedidosEnviados: pedidosEnviados || 0,
    pedidosPendentes: pedidosPendentes || 0,
    ultimaSincronizacao,
    produtosVinculados: produtosVinculados || 0,
    clientesCadastrados: clientesCadastrados || 0,
    clientesAtivos: clientesAtivos || 0,
    atividadesRecentes,
    statusSistema,
    taxasSucesso,
  }
}

// Função auxiliar para determinar o ícone com base no tipo de atividade
function getIconeAtividade(tipo: string): string {
  switch (tipo) {
    case "pedido":
      return "ShoppingCart"
    case "produto":
      return "Package"
    case "cliente":
      return "User"
    case "sincronizacao":
      return "RefreshCw"
    default:
      return "Activity"
  }
}

// Função para calcular taxas de sucesso
async function calcularTaxasSucesso(supabase: any) {
  // Taxa de sucesso de pedidos (enviados / total)
  const { count: totalPedidos } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: pedidosEnviados } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "enviado")

  const taxaPedidos = totalPedidos > 0 ? Math.round((pedidosEnviados / totalPedidos) * 100) : 0

  // Taxa de sucesso de produtos (com confiança alta / total)
  const { count: totalProdutos } = await supabase.from("mappings").select("*", { count: "exact", head: true })

  const { count: produtosConfianca } = await supabase
    .from("mappings")
    .select("*", { count: "exact", head: true })
    .gte("confidence", 80)

  const taxaProdutos = totalProdutos > 0 ? Math.round((produtosConfianca / totalProdutos) * 100) : 0

  // Taxa de clientes ativos
  const { count: totalClientes } = await supabase.from("clients").select("*", { count: "exact", head: true })

  const { count: clientesAtivos } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("bloqueado", false)

  const taxaClientes = totalClientes > 0 ? Math.round((clientesAtivos / totalClientes) * 100) : 0

  return {
    pedidos: taxaPedidos,
    produtos: taxaProdutos,
    clientes: taxaClientes,
  }
}

// Função para verificar status do sistema
async function verificarStatusSistema() {
  const supabase = getSupabase()

  // Verificar conexão com o banco de dados
  const bancoDados = await supabase
    .from("activities")
    .select("id", { count: "exact", head: true })
    .then(() => true)
    .catch(() => false)

  // Para um protótipo, simulamos as outras verificações
  // Em produção, estas seriam chamadas reais para verificar as APIs
  return {
    apiPlusDelivery: true,
    apiSaboritte: true,
    servicoSincronizacao: true,
    bancoDados: bancoDados,
    usoMemoria: Math.floor(Math.random() * 30) + 30, // Entre 30% e 60%
  }
}
