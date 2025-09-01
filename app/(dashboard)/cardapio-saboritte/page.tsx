"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Plus, RefreshCw, Search, Clock, Link } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useCardapioSaboritte } from "@/hooks/useCardapioSaboritte"
import { useSyncQueue } from "@/hooks/use-sync-queue"
import { ConfigService } from "@/lib/config-service"
import { ConfigurationData } from "@/lib/types-config"

interface Variacao {
  descricao: string
  qtd_atacado: string
  preco_atacado: string
  preco_custo: string
  preco: string
}

interface Opcional {
  id: string
  nome: string
  obrigatorio: boolean
  descricao: string
}

interface ProdutoSaboritte {
  id: string
  categoria: string
  nome: string
  descricao: string
  preco: string
  ativo: boolean
  codigoBarras: string | null
  imagem: string | null
  variacoes: Variacao[]
  opcionais: Opcional[]
}

// Nova interface para corresponder à estrutura real da resposta da API
interface SaboritteResponse {
  sucesso: boolean
  categorias: {
    [categoria: string]: ProdutoSaboritte[]
  }
}

// Interface para armazenar no localStorage
interface CardapioStorage {
  data: ProdutoSaboritte[]
  ultimaSincronizacao: string
}

// Chave para o localStorage
const STORAGE_KEY = "intermediator_cardapio_saboritte"

export default function CardapioSaboritte() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [debugInfo, setDebugInfo] = useState<string>("")
  const { startSync, finishSync, isSyncing } = useSyncQueue()
  const [loading, setLoading] = useState(true)
  const [config, setConfig] = useState<ConfigurationData>({
    saboritte: {
      credentials: {
        email: "",
        senha: "",
        api_token: "",
        api_url: "",
      },
      settings: {
        auto_sync: true,
        sync_interval: 300,
        test_mode: false,
        notify_errors: true,
      },
    },
    plus: {
      credentials: {
        email: "",
        senha: "",
        api_token: "",
        api_url: "",
      },
      settings: {
        auto_sync: true,
        sync_interval: 300,
        test_mode: false,
        notify_errors: true,
      },
    },
  })
  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      setLoading(true)
      const configurations = await ConfigService.getAllConfigurations()
      setConfig(configurations)
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }
  // Usar o hook para buscar o cardápio
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useCardapioSaboritte(config.saboritte.credentials.email, config.saboritte.credentials.senha, false)

  // Extrair produtos achatados
  const cardapio = data
    ? Object.entries(data.categorias).flatMap(([categoria, produtos]) =>
      (produtos as ProdutoSaboritte[]).map((produto: ProdutoSaboritte) => ({ ...produto, categoria }))
    )
    : []
  const ultimaSincronizacao = data ? new Date().toISOString() : null

  // Handler para sincronizar (refetch)
  const sincronizarCardapio = useCallback(async () => {
    const syncTask = { id: "cardapio-saboritte", label: "Cardápio Saboritte" }
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
          description: "Não foi possível obter o cardápio da Saboritte.",
          variant: "destructive",
        })
      }
    } finally {
      finishSync()
    }
  }, [refetch, toast, startSync, finishSync])

  // Filtrar produtos com base no termo de busca
  const produtosFiltrados = cardapio.filter((produto) => produto.nome.toLowerCase().includes(searchTerm.toLowerCase()))

  // Função para formatar o preço com base nas variações
  const formatarPreco = (produto: ProdutoSaboritte) => {
    if (produto.variacoes && produto.variacoes.length > 0) {
      return produto.variacoes.map((v) => `${v.descricao}: R$ ${v.preco}`).join(" | ")
    }
    return `R$ ${produto.preco}`
  }

  // Função para formatar os opcionais
  const formatarOpcionais = (opcionais: Opcional[] | undefined) => {
    if (!opcionais || opcionais.length === 0) return "-"
    return opcionais.map((op) => op.nome).join(", ")
  }

  // Formatar a data da última sincronização
  const formatarDataUltimaSincronizacao = () => {
    if (!ultimaSincronizacao) return "Nunca sincronizado"

    try {
      const data = new Date(ultimaSincronizacao)
      return data.toLocaleString()
    } catch (e) {
      return ultimaSincronizacao
    }
  }

  // Função para navegar para a página de vinculação
  const irParaVincular = () => {
    router.push("/produtos-vinculados")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Cardápio Saboritte</h1>
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={sincronizarCardapio} disabled={isLoading || isSyncing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Sincronizando..." : "Sincronizar Cardápio com a Saboritte"}
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
          <span>Última sincronização: {formatarDataUltimaSincronizacao()}</span>
        </div>
      )}

      {debugInfo && (
        <Card className="border-amber-800 bg-amber-950/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-400">Informações de Depuração</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-xs text-amber-300 font-mono overflow-auto max-h-40">
              {debugInfo}
            </pre>
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle>Produtos</CardTitle>
          <CardDescription>
            {cardapio.length > 0
              ? `${cardapio.length} produtos encontrados no cardápio da Saboritte.`
              : "Sincronize o cardápio para visualizar os produtos da Saboritte."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="w-full bg-zinc-900 pl-8 text-white placeholder:text-zinc-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
              Filtrar
            </Button>
          </div>

          <div className="rounded-md border border-zinc-800">
            <Table>
              <TableHeader className="bg-zinc-900">
                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                  <TableHead className="w-12 text-zinc-400">Imagem</TableHead>
                  <TableHead className="text-zinc-400">ID</TableHead>
                  <TableHead className="text-zinc-400">Nome</TableHead>
                  <TableHead className="text-zinc-400">Categoria</TableHead>
                  <TableHead className="text-zinc-400">Preço</TableHead>
                  <TableHead className="text-zinc-400">Opcionais</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-right text-zinc-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {produtosFiltrados.length > 0 ? (
                  produtosFiltrados.map((produto, idx) => (
                    <TableRow key={`${produto.id}-${idx}`} className="border-zinc-800 hover:bg-zinc-900">
                      <TableCell>
                        {produto.imagem ? (
                          <div className="relative h-10 w-10 overflow-hidden rounded-md">
                            <img
                              src={produto.imagem || "/placeholder.svg"}
                              alt={produto.nome}
                              className="object-cover"
                              width={40}
                              height={40}
                            />
                          </div>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-zinc-800 text-xs text-zinc-400">
                            N/A
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{produto.id}</TableCell>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.categoria}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={formatarPreco(produto)}>
                        {formatarPreco(produto)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={formatarOpcionais(produto.opcionais)}>
                        {formatarOpcionais(produto.opcionais)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={produto.ativo ? "default" : "secondary"}
                          className={
                            produto.ativo
                              ? "bg-green-500/20 text-green-500 hover:bg-green-500/20"
                              : "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/20"
                          }
                        >
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
                            <DropdownMenuItem className="text-white hover:bg-zinc-800">
                              Visualizar detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-white hover:bg-zinc-800">Editar</DropdownMenuItem>
                            <DropdownMenuItem className="text-white hover:bg-zinc-800" onClick={irParaVincular}>
                              <Link className="mr-2 h-4 w-4" />
                              Vincular
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500 hover:bg-zinc-800 hover:text-red-500">
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      {isLoading ? (
                        <div className="flex justify-center items-center">
                          <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                          <span>Carregando cardápio...</span>
                        </div>
                      ) : cardapio.length > 0 ? (
                        "Nenhum produto encontrado com o termo de busca."
                      ) : (
                        "Clique em 'Sincronizar Cardápio com a Saboritte' para carregar os produtos."
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
