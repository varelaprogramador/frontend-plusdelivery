"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, RefreshCw, Search, Clock, Link } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { VirtualizedTable } from "@/components/virtualized-table"
import { useFilteredData } from "@/hooks/use-filtered-data"
import { useCardapioPlus } from "@/hooks/useCardapioPlus"
import { useSyncQueue } from "@/hooks/use-sync-queue"

interface Produto {
  id: string
  nome: string
  valor: string
  promocao: string
  habilitado: boolean
  categoria?: string
}

interface Menu {
  nome: string
  disponivel: boolean
  produtos: Produto[]
}

export default function CardapioPlus() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const { startSync, finishSync, isSyncing } = useSyncQueue()

  // Usar o hook para buscar o cardápio
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCardapioPlus("elzalanches2019@gmail.com", "Plus2910@vermelho", false)

  // Extrair menus e produtos
  const cardapio = data?.menus || []
  const totalProdutos = data?.total_produtos || 0
  const ultimaSincronizacao = data ? new Date().toISOString() : null

  // Memoizar produtos achatados
  const produtosAchatados = useMemo(() => {
    return cardapio.flatMap((menu: any) =>
      menu.produtos
        .filter((produto: any) => produto.id !== "Cód")
        .map((produto: any) => ({
          ...produto,
          categoria: menu.nome,
        }))
    )
  }, [cardapio])

  // Usar hook de filtros otimizado
  const produtosFiltrados = useFilteredData({
    data: produtosAchatados,
    searchTerm,
    searchFields: ["nome", "categoria", "id"],
    debounceDelay: 300,
  })

  // Handler para sincronizar (refetch)
  const sincronizarCardapio = useCallback(async () => {
    const syncTask = { id: "cardapio-plus", label: "Cardápio Plus" }
    const canSync = startSync(syncTask)
    if (!canSync) {
      toast({
        title: "Sincronização em andamento",
        description: "Aguarde a sincronização atual finalizar antes de iniciar outra.",
        variant: "default",
      })
      return
    }
    try {
      const result = await refetch()
      if (result.isSuccess && result.data?.sucesso) {
        toast({
          title: "Cardápio sincronizado com sucesso!",
          description: `${result.data.total_produtos} produtos encontrados em ${result.data.total_menus} categorias.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro ao sincronizar",
          description: "Não foi possível obter o cardápio da Plus Delivery.",
          variant: "destructive",
        })
      }
    } finally {
      finishSync()
    }
  }, [refetch, toast, startSync, finishSync])

  // Formatar a data da última sincronização (memoizada)
  const dataFormatada = useMemo(() => {
    if (!ultimaSincronizacao) return "Nunca sincronizado"
    try {
      const data = new Date(ultimaSincronizacao)
      return data.toLocaleString()
    } catch (e) {
      return ultimaSincronizacao
    }
  }, [ultimaSincronizacao])

  // Função para navegar para a página de vinculação (memoizada)
  const irParaVincular = useCallback(() => {
    router.push("/produtos-vinculados")
  }, [router])

  // Configuração das colunas da tabela (memoizada)
  const columns = useMemo(
    () => [
      {
        key: "id",
        header: "ID",
        width: "100px",
        render: (value: string) => value || "-",
      },
      {
        key: "nome",
        header: "Nome",
        width: "300px",
        render: (value: string) => <span className="font-medium">{value}</span>,
      },
      {
        key: "categoria",
        header: "Categoria",
        width: "200px",
      },
      {
        key: "valor",
        header: "Preço",
        width: "120px",
      },
      {
        key: "promocao",
        header: "Promoção",
        width: "120px",
      },
      {
        key: "habilitado",
        header: "Status",
        width: "120px",
        render: (value: boolean) => (
          <Badge
            variant={value ? "default" : "secondary"}
            className={
              value
                ? "bg-green-500/20 text-green-500 hover:bg-green-500/20"
                : "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/20"
            }
          >
            {value ? "Ativo" : "Inativo"}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Ações",
        width: "100px",
        render: (_: any, produto: Produto) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
              <DropdownMenuItem className="text-white hover:bg-zinc-800">Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-white hover:bg-zinc-800" onClick={irParaVincular}>
                <Link className="mr-2 h-4 w-4" />
                Vincular
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-500 hover:bg-zinc-800 hover:text-red-500">Excluir</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [irParaVincular],
  )

  // Handler para clique na linha (memoizado)
  const handleRowClick = useCallback((produto: Produto) => {
    console.log("Produto clicado:", produto)
    // Aqui você pode adicionar lógica para abrir detalhes do produto
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cardápio Plus Delivery</h1>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={sincronizarCardapio} disabled={isLoading || isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Sincronizando..." : "Sincronizar Cardápio com a Plus"}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Produto
          </Button>
        </div>
      </div>

      {ultimaSincronizacao && (
        <div className="flex items-center text-sm text-zinc-400">
          <Clock className="mr-1 h-4 w-4" />
          <span>Última sincronização: {dataFormatada}</span>
        </div>
      )}

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            {totalProdutos > 0
              ? `${totalProdutos} produtos encontrados no cardápio da Plus Delivery. Exibindo ${produtosFiltrados.length} produtos.`
              : "Sincronize o cardápio para visualizar os produtos da Plus Delivery."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Buscar produtos por nome, categoria ou ID..."
                className="w-full bg-zinc-900 pl-8 text-white placeholder:text-zinc-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
              Filtrar
            </Button>
          </div>

          {produtosFiltrados.length > 0 ? (
            <VirtualizedTable
              data={produtosFiltrados}
              columns={columns}
              itemHeight={60}
              containerHeight={600}
              onRowClick={handleRowClick}
              className="w-full"
            />
          ) : (
            <div className="h-40 flex items-center justify-center rounded-md border border-zinc-800">
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                  <span>Carregando cardápio...</span>
                </div>
              ) : cardapio.length > 0 ? (
                "Nenhum produto encontrado com o termo de busca."
              ) : (
                "Clique em 'Sincronizar Cardápio com a Plus' para carregar os produtos."
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
