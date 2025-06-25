"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RefreshCw,
  Search,
  Users,
  UserCheck,
  UserX,
  BellRing,
  Bot,
  Clock,
  Phone,
  Filter,
  ChevronDown,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useClientesSaboritte } from "@/hooks/useClientesSaboritte"
import { useSyncQueue } from "@/hooks/use-sync-queue"

// Primeiro, vamos adicionar as importações necessárias para o Supabase
import { getSupabase } from "@/lib/supabase"

// Interfaces para os dados de clientes da API (camelCase)
interface ClienteAPI {
  id: string
  nome: string
  telefone: string
  bloqueado: boolean
  permitirRobo: boolean
  permitirCampanhas: boolean
}

// Interface para os dados de clientes no banco (lowercase)
interface Cliente {
  id: string
  nome: string
  telefone: string
  bloqueado: boolean
  permitirrobo: boolean
  permitircampanhas: boolean
}

interface ClientesResponse {
  sucesso: boolean
  clientes: ClienteAPI[]
  total_clientes: number
}

// Interface para armazenamento no localStorage
interface ClientesStorage {
  data: Cliente[]
  ultimaSincronizacao: string
}

// Chave para o localStorage
const STORAGE_KEY = "intermediator_clientes_saboritte"

export default function ClientesSaboritte() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([])
  const [ultimaSincronizacao, setUltimaSincronizacao] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")
  const [filtroPermiteRobo, setFiltroPermiteRobo] = useState<boolean | null>(null)
  const [filtroPermiteCampanhas, setFiltroPermiteCampanhas] = useState<boolean | null>(null)
  const [filtroBloqueado, setFiltroBloqueado] = useState<boolean | null>(null)
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    ativos: 0,
    bloqueados: 0,
    permiteRobo: 0,
    permiteCampanhas: 0,
  })
  const { startSync, finishSync, isSyncing } = useSyncQueue()

  // Usar o hook para buscar clientes da Saboritte
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useClientesSaboritte("varelaryan278@gmail.com", "Rryan0906", false)

  // Atualizar clientes quando data mudar
  useEffect(() => {
    if (data && data.sucesso) {
      // Converter para formato do banco
      const clientesAPI: Cliente[] = (data.clientes as ClienteAPI[]).map(converterClienteParaDB);
      setClientes(clientesAPI);
      setUltimaSincronizacao(new Date().toISOString());
      calcularEstatisticas(clientesAPI);
    }
  }, [data]);

  // Buscar clientes do Supabase sempre que entrar na tela
  useEffect(() => {
    carregarDadosLocais()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handler para sincronizar (refetch)
  const sincronizarClientes = useCallback(async () => {
    const syncTask = { id: "clientes-saboritte", label: "Clientes Saboritte" }
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
          title: "Clientes sincronizados com sucesso!",
          description: `${result.data.total_clientes} clientes encontrados.`,
          variant: "default",
        })
      } else {
        toast({
          title: "Erro ao sincronizar",
          description: "Não foi possível obter os clientes da Saboritte.",
          variant: "destructive",
        })
      }
    } finally {
      finishSync()
    }
  }, [refetch, toast, startSync, finishSync])

  // Filtrar clientes quando o termo de busca ou filtros mudam
  useEffect(() => {
    filtrarClientes()
  }, [searchTerm, clientes, activeTab, filtroPermiteRobo, filtroPermiteCampanhas, filtroBloqueado])

  // Carregar dados do localStorage
  const carregarDadosLocais = async () => {
    try {
      // Primeiro tentamos carregar do localStorage para exibição rápida
      const dadosSalvos = localStorage.getItem(STORAGE_KEY)
      if (dadosSalvos) {
        const { data, ultimaSincronizacao } = JSON.parse(dadosSalvos) as ClientesStorage
        setClientes(data)
        setUltimaSincronizacao(ultimaSincronizacao)
        calcularEstatisticas(data)
      }

      // Em seguida, buscamos os dados mais atualizados do Supabase
      const supabase = getSupabase()
      const { data: clientesSupabase, error } = await supabase.from("clients").select("*").order("nome")

      if (error) {
        console.error("Erro ao carregar clientes do Supabase:", error)
        // Se houver erro e temos dados do localStorage, usamos eles
        if (dadosSalvos) {
          toast({
            title: "Dados carregados do armazenamento local",
            description: "Não foi possível conectar ao banco de dados.",
            variant: "default",
          })
        }
        return
      }

      if (clientesSupabase && clientesSupabase.length > 0) {
        const clientesTyped = clientesSupabase as unknown as Cliente[]
        setClientes(clientesTyped)
        calcularEstatisticas(clientesTyped)

        // Atualizar o localStorage com os dados do Supabase
        const agora = new Date().toISOString()
        salvarNoLocalStorage(clientesTyped)
        setUltimaSincronizacao(agora)

        toast({
          title: "Dados carregados do banco de dados",
          description: `${clientesSupabase.length} clientes carregados.`,
          variant: "default",
        })
      } else if (!dadosSalvos) {
        // Se não temos dados nem no Supabase nem no localStorage
        toast({
          title: "Nenhum cliente encontrado",
          description: "Clique em 'Sincronizar Clientes' para buscar os clientes da Saboritte.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao carregar os dados dos clientes.",
        variant: "destructive",
      })
    }
  }

  // Função para salvar no localStorage
  const salvarNoLocalStorage = (data: Cliente[]) => {
    try {
      const agora = new Date().toISOString()
      const dadosParaSalvar: ClientesStorage = {
        data,
        ultimaSincronizacao: agora,
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(dadosParaSalvar))
      setUltimaSincronizacao(agora)

      return true
    } catch (error) {
      console.error("Erro ao salvar no localStorage:", error)
      toast({
        title: "Erro ao salvar localmente",
        description: "Não foi possível salvar os dados no armazenamento local.",
        variant: "destructive",
      })
      return false
    }
  }

  // Calcular estatísticas dos clientes
  const calcularEstatisticas = (clientesData: Cliente[]) => {
    const stats = {
      total: clientesData.length,
      ativos: clientesData.filter((c) => !c.bloqueado).length,
      bloqueados: clientesData.filter((c) => c.bloqueado).length,
      permiteRobo: clientesData.filter((c) => c.permitirrobo).length,
      permiteCampanhas: clientesData.filter((c) => c.permitircampanhas).length,
    }
    setEstatisticas(stats)
  }

  // Filtrar clientes com base no termo de busca e filtros ativos
  const filtrarClientes = () => {
    let filtrados = [...clientes]

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtrados = filtrados.filter(
        (cliente) =>
          cliente.nome.toLowerCase().includes(term) ||
          cliente.id.toLowerCase().includes(term) ||
          cliente.telefone.toLowerCase().includes(term),
      )
    }

    // Filtrar por tab ativa
    if (activeTab === "bloqueados") {
      filtrados = filtrados.filter((cliente) => cliente.bloqueado)
    } else if (activeTab === "ativos") {
      filtrados = filtrados.filter((cliente) => !cliente.bloqueado)
    } else if (activeTab === "robo") {
      filtrados = filtrados.filter((cliente) => cliente.permitirrobo)
    } else if (activeTab === "campanhas") {
      filtrados = filtrados.filter((cliente) => cliente.permitircampanhas)
    }

    // Aplicar filtros adicionais
    if (filtroPermiteRobo !== null) {
      filtrados = filtrados.filter((cliente) => cliente.permitirrobo === filtroPermiteRobo)
    }

    if (filtroPermiteCampanhas !== null) {
      filtrados = filtrados.filter((cliente) => cliente.permitircampanhas === filtroPermiteCampanhas)
    }

    if (filtroBloqueado !== null) {
      filtrados = filtrados.filter((cliente) => cliente.bloqueado === filtroBloqueado)
    }

    setClientesFiltrados(filtrados)
  }

  // Função para converter cliente da API para o formato do banco
  const converterClienteParaDB = (clienteAPI: ClienteAPI): Cliente => {
    return {
      id: clienteAPI.id,
      nome: clienteAPI.nome,
      telefone: clienteAPI.telefone,
      bloqueado: clienteAPI.bloqueado,
      permitirrobo: clienteAPI.permitirRobo,
      permitircampanhas: clienteAPI.permitirCampanhas,
    }
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

  // Limpar todos os filtros
  const limparFiltros = () => {
    setFiltroPermiteRobo(null)
    setFiltroPermiteCampanhas(null)
    setFiltroBloqueado(null)
    setSearchTerm("")
    setActiveTab("todos")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Clientes Saboritte</h1>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={sincronizarClientes} disabled={isLoading || isSyncing}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Sincronizando..." : "Sincronizar Clientes"}
        </Button>
      </div>

      {ultimaSincronizacao && (
        <div className="flex items-center text-sm text-zinc-400">
          <Clock className="mr-1 h-4 w-4" />
          <span>Última sincronização: {formatarDataUltimaSincronizacao()}</span>
        </div>
      )}

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total</CardTitle>
            <Users className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{estatisticas.total}</div>
            <CardDescription className="text-zinc-400">Clientes cadastrados</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Ativos</CardTitle>
            <UserCheck className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{estatisticas.ativos}</div>
            <CardDescription className="text-zinc-400">Clientes ativos</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Bloqueados</CardTitle>
            <UserX className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{estatisticas.bloqueados}</div>
            <CardDescription className="text-zinc-400">Clientes bloqueados</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Robô</CardTitle>
            <Bot className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{estatisticas.permiteRobo}</div>
            <CardDescription className="text-zinc-400">Permitem robô</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Campanhas</CardTitle>
            <BellRing className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{estatisticas.permiteCampanhas}</div>
            <CardDescription className="text-zinc-400">Permitem campanhas</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e filtros */}
      <div className="flex flex-col space-y-4">
        <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="todos" className="data-[state=active]:bg-purple-600">
                Todos ({estatisticas.total})
              </TabsTrigger>
              <TabsTrigger value="ativos" className="data-[state=active]:bg-green-600">
                Ativos ({estatisticas.ativos})
              </TabsTrigger>
              <TabsTrigger value="bloqueados" className="data-[state=active]:bg-red-600">
                Bloqueados ({estatisticas.bloqueados})
              </TabsTrigger>
              <TabsTrigger value="robo" className="data-[state=active]:bg-blue-600">
                Robô ({estatisticas.permiteRobo})
              </TabsTrigger>
              <TabsTrigger value="campanhas" className="data-[state=active]:bg-amber-600">
                Campanhas ({estatisticas.permiteCampanhas})
              </TabsTrigger>
            </TabsList>

            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
              <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>

          {showFilters && (
            <Card className="mt-4 border-zinc-800 bg-zinc-950/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="filtro-robo" className="flex-1">
                      Permite Robô
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={filtroPermiteRobo === true ? "default" : "outline"}
                        size="sm"
                        className={
                          filtroPermiteRobo === true
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                        }
                        onClick={() => setFiltroPermiteRobo(filtroPermiteRobo === true ? null : true)}
                      >
                        Sim
                      </Button>
                      <Button
                        variant={filtroPermiteRobo === false ? "default" : "outline"}
                        size="sm"
                        className={
                          filtroPermiteRobo === false
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                        }
                        onClick={() => setFiltroPermiteRobo(filtroPermiteRobo === false ? null : false)}
                      >
                        Não
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="filtro-campanhas" className="flex-1">
                      Permite Campanhas
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={filtroPermiteCampanhas === true ? "default" : "outline"}
                        size="sm"
                        className={
                          filtroPermiteCampanhas === true
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                        }
                        onClick={() => setFiltroPermiteCampanhas(filtroPermiteCampanhas === true ? null : true)}
                      >
                        Sim
                      </Button>
                      <Button
                        variant={filtroPermiteCampanhas === false ? "default" : "outline"}
                        size="sm"
                        className={
                          filtroPermiteCampanhas === false
                            ? "bg-amber-600 hover:bg-amber-700"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                        }
                        onClick={() => setFiltroPermiteCampanhas(filtroPermiteCampanhas === false ? null : false)}
                      >
                        Não
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="filtro-bloqueado" className="flex-1">
                      Status
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={filtroBloqueado === false ? "default" : "outline"}
                        size="sm"
                        className={
                          filtroBloqueado === false
                            ? "bg-green-600 hover:bg-green-700"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                        }
                        onClick={() => setFiltroBloqueado(filtroBloqueado === false ? null : false)}
                      >
                        Ativo
                      </Button>
                      <Button
                        variant={filtroBloqueado === true ? "default" : "outline"}
                        size="sm"
                        className={
                          filtroBloqueado === true
                            ? "bg-red-600 hover:bg-red-700"
                            : "border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800"
                        }
                        onClick={() => setFiltroBloqueado(filtroBloqueado === true ? null : true)}
                      >
                        Bloqueado
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={limparFiltros}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Limpar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Buscar clientes por nome, ID ou telefone..."
                className="w-full bg-zinc-900 pl-8 text-white placeholder:text-zinc-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <TabsContent value="todos" className="mt-4">
            <ClientesGrid clientes={clientesFiltrados} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="ativos" className="mt-4">
            <ClientesGrid clientes={clientesFiltrados} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="bloqueados" className="mt-4">
            <ClientesGrid clientes={clientesFiltrados} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="robo" className="mt-4">
            <ClientesGrid clientes={clientesFiltrados} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="campanhas" className="mt-4">
            <ClientesGrid clientes={clientesFiltrados} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Componente de grid de clientes
interface ClientesGridProps {
  clientes: Cliente[]
  isLoading: boolean
}

function ClientesGrid({ clientes, isLoading }: ClientesGridProps) {
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-500" />
        <span className="ml-2 text-lg">Carregando clientes...</span>
      </div>
    )
  }

  if (clientes.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/50 p-8 text-center">
        <Users className="h-10 w-10 text-zinc-500" />
        <h3 className="mt-4 text-lg font-medium">Nenhum cliente encontrado</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Tente ajustar seus filtros ou sincronizar novamente com a Saboritte.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {clientes.map((cliente, idx) => (
        <ClienteCard key={`${cliente.id}-${cliente.telefone}-${idx}`} cliente={cliente} />
      ))}
    </div>
  )
}

// Componente de card de cliente
interface ClienteCardProps {
  cliente: Cliente
}

function ClienteCard({ cliente }: ClienteCardProps) {
  // Gerar uma cor baseada no ID do cliente (para o avatar)
  const gerarCorAvatar = (id: string) => {
    const cores = [
      "bg-red-500",
      "bg-orange-500",
      "bg-amber-500",
      "bg-yellow-500",
      "bg-lime-500",
      "bg-green-500",
      "bg-emerald-500",
      "bg-teal-500",
      "bg-cyan-500",
      "bg-blue-500",
      "bg-indigo-500",
      "bg-violet-500",
      "bg-purple-500",
      "bg-fuchsia-500",
      "bg-pink-500",
      "bg-rose-500",
    ]

    // Usar o ID para selecionar uma cor
    const index = Number.parseInt(cliente.id, 10) % cores.length
    return cores[index >= 0 ? index : 0]
  }

  // Obter as iniciais do nome
  const obterIniciais = (nome: string) => {
    const partes = nome.split(" ").filter((p) => p.length > 0)
    if (partes.length === 0) return "?"
    if (partes.length === 1) return partes[0].charAt(0).toUpperCase()
    return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase()
  }

  const corAvatar = gerarCorAvatar(cliente.id)
  const iniciais = obterIniciais(cliente.nome)

  return (
    <Card
      className={`border-zinc-800 bg-zinc-950/50 transition-all hover:shadow-md hover:shadow-purple-900/10 ${cliente.bloqueado ? "opacity-70" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${corAvatar}`}>
              {iniciais}
            </div>
            <div>
              <CardTitle className="text-base font-medium line-clamp-1" title={cliente.nome}>
                {cliente.nome}
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <Phone className="mr-1 h-3 w-3" />
                {cliente.telefone}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={cliente.bloqueado ? "destructive" : "default"}
            className={
              cliente.bloqueado
                ? "bg-red-500/20 text-red-500 hover:bg-red-500/20"
                : "bg-green-500/20 text-green-500 hover:bg-green-500/20"
            }
          >
            {cliente.bloqueado ? "Bloqueado" : "Ativo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-xs text-zinc-400">ID: {cliente.id}</div>
        <Separator className="my-3 bg-zinc-800" />
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-zinc-400">Permite Robô</span>
            <Badge
              variant="outline"
              className={
                cliente.permitirrobo
                  ? "border-blue-500/50 bg-blue-500/10 text-blue-400"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
              }
            >
              {cliente.permitirrobo ? "Sim" : "Não"}
            </Badge>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-xs text-zinc-400">Permite Campanhas</span>
            <Badge
              variant="outline"
              className={
                cliente.permitircampanhas
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-zinc-700 bg-zinc-800/50 text-zinc-400"
              }
            >
              {cliente.permitircampanhas ? "Sim" : "Não"}
            </Badge>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t border-zinc-800 pt-4">
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-8 border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
            Detalhes
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Switch
              id={`robo-${cliente.id}`}
              checked={cliente.permitirrobo}
              className="data-[state=checked]:bg-blue-600"
            />
            <Label htmlFor={`robo-${cliente.id}`} className="text-xs">
              Robô
            </Label>
          </div>
          <div className="flex items-center space-x-1">
            <Switch
              id={`campanhas-${cliente.id}`}
              checked={cliente.permitircampanhas}
              className="data-[state=checked]:bg-amber-600"
            />
            <Label htmlFor={`campanhas-${cliente.id}`} className="text-xs">
              Campanhas
            </Label>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
