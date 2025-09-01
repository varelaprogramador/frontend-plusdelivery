import type {
  Order,
  OrderFilters,
  OrderStats,
  OrdersApiResponse,
} from "./types-orders";
import { STORAGE_KEY_ORDERS } from "./types-orders";
import { getSupabase } from "./supabase";
import { normalizePhoneNumber } from "./utils";

// Classe para gerenciar pedidos
export class OrdersService {
  // Buscar todos os pedidos do localStorage
  static getOrders(filters?: OrderFilters): Order[] {
    try {
      const storedOrders = localStorage.getItem(STORAGE_KEY_ORDERS);
      const orders: Order[] = storedOrders ? JSON.parse(storedOrders) : [];

      // Aplicar filtros se fornecidos
      if (!filters) return orders;

      let filtered = [...orders];

      if (filters.status && filters.status !== "all") {
        filtered = filtered.filter((order) => order.status === filters.status);
      }

      if (filters.dateFrom) {
        filtered = filtered.filter(
          (order) => new Date(order.dateTime) >= new Date(filters.dateFrom!)
        );
      }

      if (filters.dateTo) {
        filtered = filtered.filter(
          (order) => new Date(order.dateTime) <= new Date(filters.dateTo!)
        );
      }

      if (filters.clientName) {
        filtered = filtered.filter((order) =>
          order.clientName
            .toLowerCase()
            .includes(filters.clientName!.toLowerCase())
        );
      }

      if (filters.minTotal) {
        filtered = filtered.filter((order) => {
          const total = this.calculateOrderTotal(order);
          return total >= (filters.minTotal || 0);
        });
      }

      if (filters.maxTotal) {
        filtered = filtered.filter((order) => {
          const total = this.calculateOrderTotal(order);
          return total <= (filters.maxTotal || Number.POSITIVE_INFINITY);
        });
      }

      return filtered;
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error);
      return [];
    }
  }

  // Buscar um pedido específico por ID
  static getOrderById(id: string): Order | null {
    try {
      const orders = this.getOrders();
      return orders.find((order) => order.id === id) || null;
    } catch (error) {
      console.error(`Erro ao buscar pedido com ID ${id}:`, error);
      return null;
    }
  }

  // Atualizar o status de um pedido
  static updateOrderStatus(id: string, status: string): Order | null {
    try {
      const orders = this.getOrders();
      const orderIndex = orders.findIndex((order) => order.id === id);

      if (orderIndex === -1) return null;

      orders[orderIndex].status = status as any;
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));

      return orders[orderIndex];
    } catch (error) {
      console.error(`Erro ao atualizar status do pedido ${id}:`, error);
      return null;
    }
  }

  // Sincronizar pedidos da Plus Delivery
  static async syncOrdersFromPlus(): Promise<{
    success: boolean;
    message: string;
    count: number;
  }> {
    try {
      // URL da API
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/pedidos`;

      // Parâmetros de autenticação
      const params = new URLSearchParams({
        email: "elzalanches2019@gmail.com",
        senha: "Plus2910@vermelho",
      });

      const response = await fetch(`${apiUrl}?${params.toString()}`, {
        headers: {
          "x-Secret": "019639df-80f6-7d17-8de1-0a1d3436f2ce",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erro na requisição: ${response.status} - ${errorText}`
        );
      }

      const data: OrdersApiResponse = await response.json();

      if (!data.pedidos || !Array.isArray(data.pedidos)) {
        throw new Error("Formato de resposta inválido");
      }

      // Processar os pedidos recebidos
      const processedOrders = data.pedidos.map(this.parseOrderFromApi);

      // Obter pedidos existentes
      const existingOrders = this.getOrders();

      // Filtrar apenas pedidos novos (que não existem no localStorage)
      const existingIds = new Set(existingOrders.map((order) => order.id));
      const newOrders = processedOrders.filter(
        (order) => !existingIds.has(order.id)
      );

      // Combinar pedidos existentes com novos pedidos
      const updatedOrders = [...newOrders, ...existingOrders];

      // Salvar no localStorage
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(updatedOrders));

      return {
        success: true,
        message: `${newOrders.length} novos pedidos sincronizados da Plus Delivery.`,
        count: newOrders.length,
      };
    } catch (error) {
      console.error("Erro ao sincronizar pedidos da Plus:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        count: 0,
      };
    }
  }

  // Verificar se o cliente existe na Saboritte pelo número de telefone normalizado
  // Retorna o cliente se existir, ou null se não existir
  static async checkClientExistsBySaboritte(
    phoneNumber: string | null | undefined
  ): Promise<{
    exists: boolean;
    client?: {
      id: string;
      nome: string;
      telefone: string;
    };
  }> {
    if (!phoneNumber) return { exists: false };

    try {
      const normalizedPhone = normalizePhoneNumber(phoneNumber);
      if (normalizedPhone.length < 8) return { exists: false }; // Número muito curto, provavelmente inválido

      console.log(
        `Verificando cliente com telefone normalizado: ${normalizedPhone}`
      );

      const supabase = getSupabase();

      // Buscar todos os clientes e normalizar seus telefones para comparação
      const { data: clientes } = (await supabase
        .from("clients")
        .select("id, nome, telefone")) as any;

      if (!clientes || clientes.length === 0) return { exists: false };

      // Verificar se algum cliente tem o mesmo número normalizado
      const clienteExistente = clientes.find(
        (cliente: any) =>
          normalizePhoneNumber(cliente.telefone) === normalizedPhone
      );

      if (clienteExistente) {
        console.log(
          `Cliente encontrado: ${clienteExistente.nome} (ID: ${clienteExistente.id})`
        );
        return {
          exists: true,
          client: {
            id: String(clienteExistente.id),
            nome: String(clienteExistente.nome),
            telefone: String(clienteExistente.telefone),
          },
        };
      }

      return { exists: false };
    } catch (error) {
      console.error("Erro ao verificar cliente existente:", error);
      return { exists: false };
    }
  }

  // Verificar se um produto está vinculado pelo nome
  static async verificarProdutoVinculado(nomeProduto: string): Promise<{
    vinculado: boolean;
    produtoSaboritte?: {
      id: string;
      nome: string;
    };
  }> {
    try {
      console.log(`Verificando vinculação para produto: "${nomeProduto}"`);

      const supabase = getSupabase();

      // Buscar vinculação pelo nome exato do produto
      const { data: vinculacaoExata } = await supabase
        .from("product_links")
        .select("*")
        .eq("plus_name", nomeProduto)
        .limit(1);

      if (vinculacaoExata && vinculacaoExata.length > 0) {
        console.log(
          `Produto "${nomeProduto}" vinculado ao produto Saboritte "${vinculacaoExata[0].saboritte_name}"`
        );
        return {
          vinculado: true,
          produtoSaboritte: {
            id: String(vinculacaoExata[0].saboritte_id),
            nome: String(vinculacaoExata[0].saboritte_name),
          },
        };
      }

      // Buscar vinculação por nome parcial (case insensitive)
      const { data: vinculacaoParcial } = await supabase
        .from("product_links")
        .select("*")
        .ilike("plus_name", `%${nomeProduto}%`)
        .limit(1);

      if (vinculacaoParcial && vinculacaoParcial.length > 0) {
        console.log(
          `Produto "${nomeProduto}" vinculado ao produto Saboritte "${vinculacaoParcial[0].saboritte_name}" (correspondência parcial)`
        );
        return {
          vinculado: true,
          produtoSaboritte: {
            id: String(vinculacaoParcial[0].saboritte_id),
            nome: String(vinculacaoParcial[0].saboritte_name),
          },
        };
      }

      console.log(`Produto "${nomeProduto}" não está vinculado`);
      return { vinculado: false };
    } catch (error) {
      console.error(
        `Erro ao verificar vinculação do produto "${nomeProduto}":`,
        error
      );
      return { vinculado: false };
    }
  }

  // Extrair informações detalhadas do endereço
  static extrairInformacoesEndereco(endereco: string): {
    rua: string;
    numero: string;
    bairro: string;
    complemento: string;
    cidade: string;
    estado: string;
  } {
    // Inicializar valores padrão
    let rua = "";
    let numero = "";
    let bairro = "";
    let complemento = "";
    let cidade = "";
    let estado = "";

    try {
      // Tentar extrair cidade/estado
      const cidadeEstadoMatch = endereco.match(/([A-Za-z\s]+)\/([A-Z]{2})/);
      if (cidadeEstadoMatch) {
        cidade = cidadeEstadoMatch[1].trim();
        estado = cidadeEstadoMatch[2];
      }

      // Remover a parte de cidade/estado para facilitar a extração das outras partes
      const enderecoSemCidadeEstado = endereco.replace(
        /,\s*[A-Za-z\s]+\/[A-Z]{2}/,
        ""
      );

      // Dividir o endereço em partes
      const partes = enderecoSemCidadeEstado
        .split(",")
        .map((parte) => parte.trim());

      // Extrair rua e número
      if (partes.length >= 1) rua = partes[0];
      if (partes.length >= 2) numero = partes[1];

      // Tentar extrair bairro
      if (partes.length >= 3) {
        // Verificar se a terceira parte parece um bairro
        const possibleBairro = partes[2];
        if (
          possibleBairro &&
          !possibleBairro.match(/^(casa|apto|ap|apartamento|bloco|andar)/i)
        ) {
          bairro = possibleBairro;
        } else {
          complemento = possibleBairro;
        }
      }

      // Juntar o resto como complemento
      if (partes.length >= 4) {
        complemento = partes.slice(3).join(", ");
      }

      // Se não encontrou bairro, tentar extrair de outra forma
      if (!bairro) {
        const bairroMatch = endereco.match(
          /,\s*([^,]+?)\s*,\s*(?:casa|apto|ap|apartamento|bloco|andar|ao lado)/i
        );
        if (bairroMatch) bairro = bairroMatch[1].trim();
      }

      // Valores padrão se não encontrou
      if (!bairro) bairro = "Centro";
      if (!cidade) cidade = "Cidade";
      if (!estado) estado = "ES";
    } catch (error) {
      console.error("Erro ao extrair informações do endereço:", error);
    }

    return { rua, numero, bairro, complemento, cidade, estado };
  }

  // Enviar pedidos para Saboritte
  static async sendOrdersToSaboritte(
    orderIds: string[]
  ): Promise<{ success: boolean; message: string; results: any[] }> {
    try {
      // 1. Obter os pedidos selecionados
      const orders = this.getOrders();
      const selectedOrders = orders.filter((order) =>
        orderIds.includes(order.id)
      );
      const results: any[] = [];
      const now = new Date().toISOString();

      // 2. Processamento por pedido
      for (const order of selectedOrders) {
        // Verificar vinculações para cada item do pedido
        const notLinkedItems = [];
        const itensVinculados = [];

        // Verificar cada item do pedido
        for (const item of order.items) {
          const verificacao = await this.verificarProdutoVinculado(item.name);

          if (verificacao.vinculado) {
            itensVinculados.push({
              ...item,
              produtoSaboritte: verificacao.produtoSaboritte,
            });
          } else {
            notLinkedItems.push(item.name);
          }
        }

        // Se houver itens não vinculados, não enviar o pedido
        if (notLinkedItems.length > 0) {
          results.push({
            id: order.id,
            success: false,
            message: `Pedido #${order.id} possui ${notLinkedItems.length} produto(s) não vinculado(s)`,
            notLinkedItems: notLinkedItems,
          });
          continue;
        }

        // Verificar se o cliente já existe na Saboritte pelo número de telefone normalizado
        // e obter seus dados se existir
        let contactIsexiste = false;
        let clienteNome = order.clientName; // Por padrão, usa o nome do pedido
        let clienteId = "";

        if (order.clientPhone) {
          const clienteResult = await this.checkClientExistsBySaboritte(
            order.clientPhone
          );
          contactIsexiste = clienteResult.exists;

          // Se o cliente existir, usar o nome do cliente cadastrado na Saboritte
          if (contactIsexiste && clienteResult.client) {
            clienteNome = clienteResult.client.nome;
            clienteId = clienteResult.client.id;
            console.log(
              `Cliente existente encontrado: ${clienteNome} (ID: ${clienteId}). Usando este nome em vez de "${order.clientName}"`
            );
          }
        }

        // Preparar os dados para enviar
        try {
          // URL da API
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/enviapedido`;

          // Parâmetros de autenticação
          const params = new URLSearchParams({
            email: "varelaryan278@gmail.com",
            senha: "Rryan0906",
          });

          // Normalizar o telefone do cliente antes de enviar
          const normalizedPhone = normalizePhoneNumber(order.clientPhone || "");

          // Extrair informações detalhadas do endereço completo
          const enderecoCompleto = `${order.deliveryAddress.street}, ${
            order.deliveryAddress.number
          }, ${order.deliveryAddress.neighborhood || ""}, ${
            order.deliveryAddress.complement || ""
          }, ${order.deliveryAddress.city}/${order.deliveryAddress.state}`;

          const infoEndereco =
            this.extrairInformacoesEndereco(enderecoCompleto);

          // Mapear o método de pagamento para um valor aceito pela API
          let metodoPagamento = "Dinheiro"; // Valor padrão
          switch (order.paymentInfo.method) {
            case "credit_card":
              metodoPagamento = "Cartão de Crédito";
              break;
            case "debit_card":
              metodoPagamento = "Cartão de Débito";
              break;
            case "cash":
              metodoPagamento = "Dinheiro";
              break;
            case "pix":
              metodoPagamento = "PIX";
              break;
          }

          // Extrair os IDs dos produtos vinculados e repetir conforme a quantidade
          const id_produtos: string[] = [];
          itensVinculados.forEach((item) => {
            // Repetir o ID conforme a quantidade do item
            for (let i = 0; i < item.quantity; i++) {
              if (item.produtoSaboritte && item.produtoSaboritte.id) {
                id_produtos.push(item.produtoSaboritte.id);
              }
            }
          });
          const requestData = {
            id: order.id,
            nome: clienteNome, // API espera "nome" em vez de "cliente"
            telefone: normalizedPhone,
            endereco: infoEndereco.rua,
            numero: infoEndereco.numero,
            bairro: infoEndereco.bairro,
            cidade: infoEndereco.cidade,
            estado: infoEndereco.estado,
            complemento:
              infoEndereco.complemento ||
              order.deliveryAddress.complement ||
              "",
            id_produtos: id_produtos, // Array de IDs de produtos, repetidos conforme quantidade
            pagamento: metodoPagamento,
            contactIsexiste: contactIsexiste,
          };

          // Se o cliente existir, adicionar o ID
          if (clienteId) {
            (requestData as any).clienteId = clienteId;
          }

          console.log(
            "Dados enviados para a API:",
            JSON.stringify(requestData, null, 2)
          );

          // Fazer a requisição
          const response = await fetch(`${apiUrl}?${params.toString()}`, {
            method: "POST",
            headers: {
              "x-Secret": "019639df-80f6-7d17-8de1-0a1d3436f2ce",
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(requestData),
          });

          // Processar a resposta
          let responseData;
          try {
            responseData = await response.json();
          } catch (error) {
            // Se não conseguir parsear como JSON, tenta obter o texto
            const responseText = await response.text();
            responseData = { error: responseText };
          }

          if (!response.ok) {
            results.push({
              id: order.id,
              success: false,
              message: `Erro ao enviar pedido #${order.id}: ${
                responseData.error || "Erro desconhecido"
              }`,
              responseStatus: response.status,
              responseData,
            });
            continue;
          }

          if (responseData.sucesso) {
            // Atualizar o status do pedido
            const orderIndex = orders.findIndex((o) => o.id === order.id);
            if (orderIndex !== -1) {
              orders[orderIndex] = {
                ...order,
                status: "processing" as const,
                sentToSaboritte: true,
                saboritteSentAt: now,
              };
            }

            results.push({
              id: order.id,
              success: true,
              message: `Pedido #${order.id} enviado com sucesso`,
              responseData,
              clienteExistente: contactIsexiste,
              clienteNomeOriginal: order.clientName,
              clienteNomeUsado: clienteNome,
              clienteId: clienteId || undefined,
              telefoneNormalizado: normalizedPhone,
              telefoneOriginal: order.clientPhone,
              itensVinculados: itensVinculados.map((item) => ({
                original: item.name,
                vinculado: item.produtoSaboritte?.nome,
                id: item.produtoSaboritte?.id,
                quantidade: item.quantity,
              })),
            });
          } else {
            results.push({
              id: order.id,
              success: false,
              message: `Falha ao enviar pedido #${order.id}: ${
                responseData.mensagem || "Erro desconhecido"
              }`,
              responseData,
            });
          }
        } catch (error) {
          console.error(`Erro ao enviar pedido #${order.id}:`, error);
          results.push({
            id: order.id,
            success: false,
            message: `Erro ao enviar pedido #${order.id}: ${
              error instanceof Error ? error.message : "Erro desconhecido"
            }`,
            error: error instanceof Error ? error.stack : String(error),
          });
        }
      }

      // Salvar as atualizações dos pedidos
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));

      // Determinar se houve sucesso com base nos resultados
      const successCount = results.filter((r) => r.success).length;

      return {
        success: successCount > 0,
        message: `${successCount}/${selectedOrders.length} pedidos enviados para Saboritte`,
        results,
      };
    } catch (error) {
      console.error("Erro ao enviar pedidos para Saboritte:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        results: [],
      };
    }
  }

  // Obter estatísticas de pedidos
  static getOrderStats(): OrderStats {
    try {
      const orders = this.getOrders();

      // Contar pedidos por status
      const pending = orders.filter(
        (order) => order.status === "pending"
      ).length;
      const processing = orders.filter(
        (order) => order.status === "processing"
      ).length;
      const completed = orders.filter(
        (order) => order.status === "completed"
      ).length;
      const cancelled = orders.filter(
        (order) => order.status === "cancelled"
      ).length;
      const error = orders.filter((order) => order.status === "error").length;

      // Calcular receita total
      const totalRevenue = orders
        .filter((order) => order.status !== "cancelled")
        .reduce((sum, order) => sum + this.calculateOrderTotal(order), 0);

      // Filtrar pedidos de hoje
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter((order) => {
        const orderDate = new Date(order.dateTime);
        return orderDate >= today;
      });

      // Calcular receita de hoje
      const todayRevenue = todayOrders.reduce(
        (sum, order) => sum + this.calculateOrderTotal(order),
        0
      );

      return {
        total: orders.length,
        pending,
        processing,
        completed,
        cancelled,
        error,
        totalRevenue,
        todayOrders: todayOrders.length,
        todayRevenue,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas de pedidos:", error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        completed: 0,
        cancelled: 0,
        error: 0,
        totalRevenue: 0,
        todayOrders: 0,
        todayRevenue: 0,
      };
    }
  }

  // Calcular o total de um pedido
  static calculateOrderTotal(order: Order): number {
    const itemsTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = order.deliveryFee || 0;
    const convenienceFee = order.convenienceFee || 0;

    return itemsTotal + deliveryFee + convenienceFee;
  }

  // Função para analisar o texto de detalhes e extrair informações estruturadas
  private static parseOrderDetails(detailsHtml: string): {
    clientPhone?: string;
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      reference?: string;
    };
    items: {
      name: string;
      quantity: number;
      price: number;
      notes?: string;
    }[];
    deliveryFee?: number;
    convenienceFee?: number;
    estimatedDeliveryTime?: string;
    paymentMethod: string;
    changeFor?: number;
    total: number;
  } {
    // Converter <br> para quebras de linha para facilitar o parsing
    const details = detailsHtml.replace(/<br>/g, "\n");

    // Extrair telefone do cliente
    const phoneMatch = details.match(
      /Telefone:.*?(\d{10,11}|\d{2}\s\d{8,9}|\d{2}\s\d{4,5}-\d{4})/
    );
    const clientPhone = phoneMatch ? phoneMatch[1].trim() : undefined;

    // Extrair endereço
    // Removido o flag /s para compatibilidade com targets anteriores ao ES2018
    const addressMatch = details.match(/Endereço: (.*?)(?=\n\n|$)/);
    let street = "";
    let number = "";
    const complement = "";
    let neighborhood = "";
    let city = "";
    let state = "";
    let reference = "";

    if (addressMatch && addressMatch[1]) {
      const addressParts = addressMatch[1]
        .split(",")
        .map((part) => part.trim());

      if (addressParts.length >= 1) street = addressParts[0];
      if (addressParts.length >= 2) number = addressParts[1];

      // Tentar extrair bairro
      const neighborhoodMatch = addressMatch[1].match(
        /(?:,\s*)([^,]+?)(?:,\s*(?:Em frente|Próximo|Referência|Portão|[A-Z][A-Za-z]+\/[A-Z]{2}))/
      );
      if (neighborhoodMatch) neighborhood = neighborhoodMatch[1].trim();

      // Tentar extrair cidade/estado
      const cityStateMatch = addressMatch[1].match(/([A-Za-z\s]+)\/([A-Z]{2})/);
      if (cityStateMatch) {
        city = cityStateMatch[1].trim();
        state = cityStateMatch[2];
      }

      // Tentar extrair referência
      const referenceMatch = addressMatch[1].match(
        /(?:Em frente|Próximo|Referência|Portão)(.*?)(?=,\s*[A-Z][A-Za-z]+\/[A-Z]{2}|$)/
      );
      if (referenceMatch) reference = referenceMatch[1].trim();
    }

    // Extrair itens do pedido
    const itemsSection = details.match(
      /==== Conteúdo ====\n([\s\S]*?)(?=\n\nTAXA DE ENTREGA|$)/
    );
    const items: {
      name: string;
      quantity: number;
      price: number;
      notes?: string;
    }[] = [];

    if (itemsSection && itemsSection[1]) {
      const itemLines = itemsSection[1]
        .split("\n")
        .filter((line) => line.trim() !== "");

      for (const line of itemLines) {
        const itemMatch = line.match(
          /(\d+)\s*-\s*(.*?)\s*-\s*R\$\s*(\d+(?:\.\d+)?)/
        );
        if (itemMatch) {
          const quantity = Number.parseInt(itemMatch[1], 10);
          const name = itemMatch[2].trim();
          const price = Number.parseFloat(itemMatch[3]);

          // Verificar se há observações para este item
          const notesMatch = line.match(/R\$\s*\d+(?:\.\d+)?\s*(.*)/);
          const notes =
            notesMatch && notesMatch[1] ? notesMatch[1].trim() : undefined;

          items.push({ name, quantity, price, notes });
        }
      }
    }

    // Extrair taxa de entrega
    const deliveryFeeMatch = details.match(
      /TAXA DE ENTREGA: R\$ (\d+(?:\.\d+)?)/
    );
    const deliveryFee = deliveryFeeMatch
      ? Number.parseFloat(deliveryFeeMatch[1])
      : undefined;

    // Extrair taxa de conveniência
    const convenienceFeeMatch = details.match(
      /TAXA DE CONVENIÊNCIA: R\$ (\d+(?:\.\d+)?)/
    );
    const convenienceFee = convenienceFeeMatch
      ? Number.parseFloat(convenienceFeeMatch[1])
      : undefined;

    // Extrair tempo estimado de entrega
    const estimatedTimeMatch = details.match(
      /Tempo de entrega: (\d+(?:-\d+)?min)/
    );
    const estimatedDeliveryTime = estimatedTimeMatch
      ? estimatedTimeMatch[1]
      : undefined;

    // Extrair método de pagamento
    const paymentMethodMatch = details.match(/Pagamento: (.*?)(?=\n|$)/);
    const paymentMethod = paymentMethodMatch
      ? paymentMethodMatch[1].trim()
      : "other";

    // Extrair troco
    const changeForMatch = details.match(/Troco para: R\$ (\d+(?:\.\d+)?)/);
    const changeForText = details.match(/Troco para: R\$ (SEM TROCO)/i);
    const changeFor = changeForMatch
      ? Number.parseFloat(changeForMatch[1])
      : changeForText
      ? undefined
      : undefined;

    // Extrair total
    const totalMatch = details.match(/TOTAL: R\$ (\d+(?:\.\d+)?)/);
    const total = totalMatch
      ? Number.parseFloat(totalMatch[1])
      : items.reduce((sum, item) => sum + item.price * item.quantity, 0) +
        (deliveryFee || 0) +
        (convenienceFee || 0);

    return {
      clientPhone,
      address: {
        street,
        number,
        complement,
        neighborhood,
        city,
        state,
        reference,
      },
      items,
      deliveryFee,
      convenienceFee,
      estimatedDeliveryTime,
      paymentMethod,
      changeFor,
      total,
    };
  }

  // Função para converter o pedido da API para o formato da aplicação
  private static parseOrderFromApi(
    apiOrder: OrdersApiResponse["pedidos"][0]
  ): Order {
    // Extrair data e hora do formato "Data: 15/05/2025 - Hora: 23:23:34"
    const dateTimeMatch = apiOrder.dataHora.match(
      /Data: (\d{2}\/\d{2}\/\d{4}) - Hora: (\d{2}:\d{2}:\d{2})/
    );
    let dateTime = new Date().toISOString();

    if (dateTimeMatch) {
      const [_, datePart, timePart] = dateTimeMatch;
      const [day, month, year] = datePart.split("/").map(Number);
      const [hours, minutes, seconds] = timePart.split(":").map(Number);

      const date = new Date(year, month - 1, day, hours, minutes, seconds);
      dateTime = date.toISOString();
    }

    // Analisar os detalhes do pedido
    const parsedDetails = OrdersService.parseOrderDetails(apiOrder.detalhes);

    // Determinar o método de pagamento
    let paymentMethod: "credit_card" | "debit_card" | "cash" | "pix" | "other" =
      "other";
    if (parsedDetails.paymentMethod) {
      const method = parsedDetails.paymentMethod.toLowerCase();
      if (method.includes("cartão") && method.includes("crédito")) {
        paymentMethod = "credit_card";
      } else if (method.includes("cartão") && method.includes("débito")) {
        paymentMethod = "debit_card";
      } else if (method.includes("dinheiro") || method.includes("vista")) {
        paymentMethod = "cash";
      } else if (method.includes("pix")) {
        paymentMethod = "pix";
      }
    }

    // Construir o objeto de pedido
    return {
      id: apiOrder.id,
      clientName: apiOrder.cliente,
      clientPhone: parsedDetails.clientPhone,
      dateTime,
      status: "pending", // Status padrão para novos pedidos
      items: parsedDetails.items.map((item, index) => ({
        id: `${apiOrder.id}-item-${index}`,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
      })),
      deliveryAddress: {
        street: parsedDetails.address.street,
        number: parsedDetails.address.number,
        complement: parsedDetails.address.complement,
        neighborhood: parsedDetails.address.neighborhood,
        city: parsedDetails.address.city,
        state: parsedDetails.address.state,
        reference: parsedDetails.address.reference,
      },
      paymentInfo: {
        method: paymentMethod,
        total: parsedDetails.total,
        change: parsedDetails.changeFor,
        paid: false, // Assumimos que o pagamento ainda não foi confirmado
      },
      deliveryFee: parsedDetails.deliveryFee,
      convenienceFee: parsedDetails.convenienceFee,
      estimatedDeliveryTime: parsedDetails.estimatedDeliveryTime,
      sentToSaboritte: false,
      rawDetails: apiOrder.detalhes,
    };
  }
}
