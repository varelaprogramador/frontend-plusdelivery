"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart3,
  Package,
  Settings,
  ShoppingCart,
  Users,
  Pizza,
  ShoppingBag,
  LinkIcon,
  RefreshCw,
  Search,
  UserPlus,
  Send,
} from "lucide-react"

export default function DocPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-2">Documentação do Intermediator</h1>
      <p className="text-zinc-400 mb-8">Guia completo para utilização da ferramenta de integração entre plataformas</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 gap-2">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cardapio-plus">Cardápio Plus</TabsTrigger>
          <TabsTrigger value="cardapio-saboritte">Cardápio Saboritte</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="produtos">Produtos Vinculados</TabsTrigger>
          <TabsTrigger value="clientes">Clientes</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Intermediator</CardTitle>
              <CardDescription>Ferramenta de integração entre plataformas de delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                O Intermediator é uma ferramenta desenvolvida para facilitar a integração entre diferentes plataformas
                de delivery, permitindo que restaurantes e estabelecimentos gerenciem seus pedidos, produtos e clientes
                de forma centralizada.
              </p>

              <h3 className="text-lg font-medium mt-4">Principais funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sincronização de cardápios entre plataformas</li>
                <li>Vinculação de produtos entre diferentes sistemas</li>
                <li>Gerenciamento centralizado de pedidos</li>
                <li>Sincronização de dados de clientes</li>
                <li>Envio automático de pedidos para o sistema Saboritte</li>
                <li>Visualização de métricas e estatísticas</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Como começar:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Configure suas credenciais de acesso nas <strong>Configurações</strong>
                </li>
                <li>Sincronize os cardápios do Plus e Saboritte</li>
                <li>Vincule os produtos correspondentes entre as plataformas</li>
                <li>Comece a receber e gerenciar pedidos automaticamente</li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </CardTitle>
              <CardDescription>Visão geral das métricas e atividades do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                O Dashboard apresenta uma visão geral das principais métricas e atividades do sistema, permitindo
                monitorar o desempenho da integração em tempo real.
              </p>

              <h3 className="text-lg font-medium mt-4">Funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Visualização de pedidos recentes</li>
                <li>Estatísticas de produtos vinculados</li>
                <li>Taxa de sucesso de sincronização</li>
                <li>Gráficos de desempenho</li>
                <li>Alertas e notificações importantes</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Como utilizar:</h3>
              <p>
                O Dashboard é atualizado automaticamente e exibe as informações mais recentes. Você pode clicar em
                qualquer card para acessar informações mais detalhadas sobre aquela métrica específica.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cardapio-plus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pizza className="h-5 w-5" />
                Cardápio Plus
              </CardTitle>
              <CardDescription>Gerenciamento dos produtos do Cardápio Plus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A página de Cardápio Plus permite visualizar e gerenciar todos os produtos disponíveis na plataforma
                Plus. Aqui você pode sincronizar produtos, visualizar detalhes e preparar itens para vinculação.
              </p>

              <h3 className="text-lg font-medium mt-4">Funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Listagem completa de produtos do Plus</li>
                <li>Sincronização manual e automática</li>
                <li>Filtros por categoria e disponibilidade</li>
                <li>Visualização detalhada de cada produto</li>
                <li>Status de vinculação com o Saboritte</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Como sincronizar produtos:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Acesse a página de Cardápio Plus</li>
                <li>
                  Clique no botão <strong>Sincronizar Produtos</strong>
                </li>
                <li>Aguarde a conclusão do processo de sincronização</li>
                <li>Verifique os produtos atualizados na lista</li>
              </ol>

              <div className="flex items-center p-4 bg-zinc-800 rounded-md mt-4">
                <RefreshCw className="h-5 w-5 mr-2 text-blue-400" />
                <p className="text-sm">
                  <strong>Dica:</strong> Recomendamos sincronizar o cardápio diariamente para manter os produtos
                  atualizados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cardapio-saboritte" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Cardápio Saboritte
              </CardTitle>
              <CardDescription>Gerenciamento dos produtos do Cardápio Saboritte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A página de Cardápio Saboritte permite visualizar e gerenciar todos os produtos disponíveis na
                plataforma Saboritte. Esta visualização é essencial para o processo de vinculação de produtos entre as
                plataformas.
              </p>

              <h3 className="text-lg font-medium mt-4">Funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Listagem completa de produtos do Saboritte</li>
                <li>Sincronização com a API do Saboritte</li>
                <li>Filtros por categoria e disponibilidade</li>
                <li>Visualização detalhada de cada produto</li>
                <li>Status de vinculação com o Plus</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Como sincronizar produtos:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Acesse a página de Cardápio Saboritte</li>
                <li>
                  Clique no botão <strong>Sincronizar Produtos</strong>
                </li>
                <li>Aguarde a conclusão do processo de sincronização</li>
                <li>Verifique os produtos atualizados na lista</li>
              </ol>

              <div className="flex items-center p-4 bg-zinc-800 rounded-md mt-4">
                <Search className="h-5 w-5 mr-2 text-blue-400" />
                <p className="text-sm">
                  <strong>Dica:</strong> Utilize a barra de pesquisa para encontrar produtos específicos rapidamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pedidos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Pedidos
              </CardTitle>
              <CardDescription>Gerenciamento e envio de pedidos para o Saboritte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A página de Pedidos permite visualizar, gerenciar e enviar pedidos recebidos do Plus para o sistema
                Saboritte. Aqui você pode acompanhar o status de cada pedido e realizar o envio manual quando
                necessário.
              </p>

              <h3 className="text-lg font-medium mt-4">Funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Listagem de todos os pedidos recebidos</li>
                <li>Filtros por status, data e cliente</li>
                <li>Visualização detalhada de cada pedido</li>
                <li>Envio manual de pedidos para o Saboritte</li>
                <li>Histórico de tentativas de envio</li>
                <li>Notificações de erros e sucessos</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Como enviar um pedido:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Localize o pedido desejado na lista</li>
                <li>
                  Clique no botão <strong>Detalhes</strong> para verificar as informações
                </li>
                <li>Confirme se todos os produtos estão vinculados corretamente</li>
                <li>
                  Clique no botão <strong>Enviar para Saboritte</strong>
                </li>
                <li>Aguarde a confirmação de envio</li>
              </ol>

              <div className="flex items-center p-4 bg-zinc-800 rounded-md mt-4">
                <Send className="h-5 w-5 mr-2 text-blue-400" />
                <p className="text-sm">
                  <strong>Importante:</strong> Pedidos só podem ser enviados se todos os produtos estiverem corretamente
                  vinculados.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Produtos Vinculados
              </CardTitle>
              <CardDescription>Gerenciamento das vinculações entre produtos Plus e Saboritte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A página de Produtos Vinculados permite criar e gerenciar as vinculações entre produtos do Plus e do
                Saboritte. Esta é uma etapa crucial para garantir que os pedidos sejam enviados corretamente entre as
                plataformas.
              </p>

              <h3 className="text-lg font-medium mt-4">Funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Listagem de todas as vinculações existentes</li>
                <li>Criação de novas vinculações</li>
                <li>Edição e remoção de vinculações</li>
                <li>Filtros por categoria e status</li>
                <li>Sugestões automáticas de vinculação</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Como vincular produtos:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  Clique no botão <strong>Nova Vinculação</strong>
                </li>
                <li>Selecione o produto do Plus</li>
                <li>Selecione o produto correspondente do Saboritte</li>
                <li>Confirme a vinculação</li>
                <li>Verifique a nova vinculação na lista</li>
              </ol>

              <div className="flex items-center p-4 bg-zinc-800 rounded-md mt-4">
                <LinkIcon className="h-5 w-5 mr-2 text-blue-400" />
                <p className="text-sm">
                  <strong>Dica:</strong> Utilize a função de sugestão automática para agilizar o processo de vinculação
                  de produtos similares.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clientes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clientes Saboritte
              </CardTitle>
              <CardDescription>Gerenciamento e sincronização de dados de clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A página de Clientes Saboritte permite visualizar e gerenciar os dados de clientes sincronizados com o
                sistema Saboritte. Aqui você pode verificar informações de contato, histórico de pedidos e sincronizar
                novos clientes.
              </p>

              <h3 className="text-lg font-medium mt-4">Funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Listagem completa de clientes</li>
                <li>Filtros por nome, telefone e data de cadastro</li>
                <li>Visualização detalhada de cada cliente</li>
                <li>Sincronização manual e automática</li>
                <li>Histórico de pedidos por cliente</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Como sincronizar clientes:</h3>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Acesse a página de Clientes Saboritte</li>
                <li>
                  Clique no botão <strong>Sincronizar Clientes</strong>
                </li>
                <li>Aguarde a conclusão do processo</li>
                <li>Verifique os novos clientes na lista</li>
              </ol>

              <div className="flex items-center p-4 bg-zinc-800 rounded-md mt-4">
                <UserPlus className="h-5 w-5 mr-2 text-blue-400" />
                <p className="text-sm">
                  <strong>Importante:</strong> O sistema verifica automaticamente se um cliente já existe antes de criar
                  um novo registro.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>Configurações gerais do sistema e integrações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                A página de Configurações permite ajustar parâmetros do sistema, configurar credenciais de API e
                personalizar o comportamento das integrações entre as plataformas.
              </p>

              <h3 className="text-lg font-medium mt-4">Funcionalidades:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Configuração de credenciais de API</li>
                <li>Ajuste de intervalos de sincronização</li>
                <li>Personalização de notificações</li>
                <li>Configurações de mapeamento de dados</li>
                <li>Backup e restauração de dados</li>
              </ul>

              <h3 className="text-lg font-medium mt-4">Configurações importantes:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>API Key Saboritte:</strong> Chave de acesso para a API do Saboritte
                </li>
                <li>
                  <strong>API Key Plus:</strong> Chave de acesso para a API do Plus
                </li>
                <li>
                  <strong>Intervalo de Sincronização:</strong> Frequência de sincronização automática
                </li>
                <li>
                  <strong>Notificações por Email:</strong> Configuração para receber alertas
                </li>
                <li>
                  <strong>Mapeamento de Categorias:</strong> Correspondência entre categorias das plataformas
                </li>
              </ul>

              <div className="flex items-center p-4 bg-zinc-800 rounded-md mt-4">
                <Settings className="h-5 w-5 mr-2 text-blue-400" />
                <p className="text-sm">
                  <strong>Atenção:</strong> Alterações nas configurações de API podem afetar o funcionamento das
                  integrações.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 p-6 bg-zinc-800 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Precisa de mais ajuda?</h2>
        <p className="mb-4">
          Se você tiver dúvidas adicionais ou precisar de suporte técnico, consulte a documentação acima ou entre em
          contato com o administrador do sistema.
        </p>
      </div>
    </div>
  )
}
