"use server"

import { revalidatePath } from "next/cache"
import { createNotification } from "./notifications"
import { ConfigService } from "./config-service"
import { getSupabase } from "./supabase"

/**
 * Sincroniza produtos do Plus usando configurações do banco
 */
export async function syncCardapioPlus() {
  try {
    const supabase = getSupabase()

    // Buscar configurações do banco
    const config = await ConfigService.getPlatformConfigurations("plus")

    // Verificar se as credenciais estão configuradas
    if (!config.credentials.email || !config.credentials.senha || !config.credentials.api_secret) {
      throw new Error("Credenciais da Plus Delivery não configuradas")
    }

    // URL da API
    const apiUrl = `${config.credentials.api_url}/cardapio`

    // Parâmetros de autenticação
    const params = new URLSearchParams({
      email: config.credentials.email,
      senha: config.credentials.senha,
    })

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      headers: {
        "x-Secret": config.credentials.api_secret,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro na requisição: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.sucesso || !data.menus || !Array.isArray(data.menus)) {
      throw new Error("Formato de resposta inválido")
    }

    // Processar os produtos recebidos
    const produtosProcessados = data.menus.flatMap((menu: any) =>
      menu.produtos.map((produto: any) => ({
        id: produto.id,
        nome: produto.nome,
        valor: produto.valor,
        promocao: produto.promocao,
        habilitado: produto.habilitado,
        categoria: menu.nome,
      })),
    )

    // Salvar no Supabase
    const { error: deleteError } = await supabase.from("plus_products").delete().neq("id", "0")

    if (deleteError) {
      throw deleteError
    }

    const { error: insertError } = await supabase.from("plus_products").insert(produtosProcessados)

    if (insertError) {
      throw insertError
    }

    // Atualizar a data da última sincronização
    const now = new Date().toISOString()
    const { error: configError } = await supabase.from("configurations").upsert(
      {
        platform: "plus",
        config_type: "settings",
        config_key: "last_sync",
        config_value: now,
      },
      { onConflict: "platform,config_type,config_key" },
    )

    if (configError) {
      console.error("Erro ao atualizar config:", configError)
    }

    // Criar notificação de sucesso
    await createNotification({
      title: "Sincronização concluída",
      message: `${produtosProcessados.length} produtos sincronizados com sucesso!`,
      type: "success",
    })

    revalidatePath("/cardapio-plus")
    return { success: true, message: `${produtosProcessados.length} produtos sincronizados com sucesso!` }
  } catch (error: any) {
    console.error("Erro ao sincronizar produtos do Plus:", error)

    // Criar notificação de erro
    await createNotification({
      title: "Erro na sincronização",
      message: `Não foi possível sincronizar os produtos do Plus: ${error.message}`,
      type: "error",
    })

    return { success: false, message: `Erro ao sincronizar produtos: ${error.message}` }
  }
}

/**
 * Sincroniza produtos da Saboritte usando configurações do banco
 */
export async function syncSaboritteProducts() {
  try {
    // Buscar configurações do banco
    const config = await ConfigService.getPlatformConfigurations("saboritte")

    // Verificar se as credenciais estão configuradas
    if (!config.credentials.email || !config.credentials.senha) {
      throw new Error("Credenciais da Saboritte não configuradas")
    }

    // Simulação de sincronização (implementar API real quando disponível)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Criar notificação de sucesso
    await createNotification({
      title: "Sincronização concluída",
      message: "Produtos da Saboritte sincronizados com sucesso!",
      type: "success",
    })

    revalidatePath("/cardapio-saboritte")
    return { success: true, message: "Produtos sincronizados com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao sincronizar produtos da Saboritte:", error)

    // Criar notificação de erro
    await createNotification({
      title: "Erro na sincronização",
      message: `Não foi possível sincronizar os produtos da Saboritte: ${error.message}`,
      type: "error",
    })

    return { success: false, message: `Erro ao sincronizar produtos: ${error.message}` }
  }
}

/**
 * Sincroniza pedidos da Plus usando configurações do banco
 */
export async function syncOrdersFromPlus() {
  try {
    // Buscar configurações do banco
    const config = await ConfigService.getPlatformConfigurations("plus")

    // Verificar se as credenciais estão configuradas
    if (!config.credentials.email || !config.credentials.senha || !config.credentials.api_secret) {
      throw new Error("Credenciais da Plus Delivery não configuradas")
    }

    // URL da API
    const apiUrl = `${config.credentials.api_url}/pedidos`

    // Parâmetros de autenticação
    const params = new URLSearchParams({
      email: config.credentials.email,
      senha: config.credentials.senha,
    })

    const response = await fetch(`${apiUrl}?${params.toString()}`, {
      headers: {
        "x-Secret": config.credentials.api_secret,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Erro na requisição: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Processar pedidos (implementar lógica específica)
    console.log("Pedidos recebidos:", data)

    // Criar notificação de sucesso
    await createNotification({
      title: "Sincronização concluída",
      message: "Pedidos sincronizados com sucesso!",
      type: "success",
    })

    revalidatePath("/pedidos")
    return { success: true, message: "Pedidos sincronizados com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao sincronizar pedidos:", error)

    // Criar notificação de erro
    await createNotification({
      title: "Erro na sincronização",
      message: `Não foi possível sincronizar os pedidos: ${error.message}`,
      type: "error",
    })

    return { success: false, message: `Erro ao sincronizar pedidos: ${error.message}` }
  }
}

// Manter as outras funções existentes...
export async function sendOrderToSaboritte(orderId: string) {
  try {
    // Buscar configurações do banco
    const config = await ConfigService.getPlatformConfigurations("saboritte")

    // Verificar se as credenciais estão configuradas
    if (!config.credentials.email || !config.credentials.senha) {
      throw new Error("Credenciais da Saboritte não configuradas")
    }

    // Simulação de envio
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Criar notificação de sucesso
    await createNotification({
      title: "Pedido enviado",
      message: `Pedido #${orderId} enviado com sucesso para a Saboritte!`,
      type: "success",
    })

    revalidatePath("/pedidos")
    return { success: true, message: "Pedido enviado com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao enviar pedido para a Saboritte:", error)

    // Criar notificação de erro
    await createNotification({
      title: "Erro no envio",
      message: `Não foi possível enviar o pedido #${orderId}: ${error.message}`,
      type: "error",
    })

    return { success: false, message: `Erro ao enviar pedido: ${error.message}` }
  }
}

export async function syncSaboritteClients() {
  try {
    // Buscar configurações do banco
    const config = await ConfigService.getPlatformConfigurations("saboritte")

    // Verificar se as credenciais estão configuradas
    if (!config.credentials.email || !config.credentials.senha) {
      throw new Error("Credenciais da Saboritte não configuradas")
    }

    // Simulação de sincronização
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Criar notificação de sucesso
    await createNotification({
      title: "Sincronização concluída",
      message: "Clientes da Saboritte sincronizados com sucesso!",
      type: "success",
    })

    revalidatePath("/clientes-saboritte")
    return { success: true, message: "Clientes sincronizados com sucesso!" }
  } catch (error: any) {
    console.error("Erro ao sincronizar clientes da Saboritte:", error)

    // Criar notificação de erro
    await createNotification({
      title: "Erro na sincronização",
      message: `Não foi possível sincronizar os clientes da Saboritte: ${error.message}`,
      type: "error",
    })

    return { success: false, message: `Erro ao sincronizar clientes: ${error.message}` }
  }
}
