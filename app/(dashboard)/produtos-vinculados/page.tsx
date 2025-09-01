"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Link, Trash2, Layers, RefreshCw, Loader2, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
  SelectGroup,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  type ProdutoPlus,
  type ProdutoSaboritte,
  type Variacao,
  STORAGE_KEY_PLUS,
  STORAGE_KEY_SABORITTE,
  type CardapioStoragePlus,
  type CardapioStorageSaboritte,
} from "@/lib/types"
import { getSupabase, type ProductLinkRow } from "@/lib/supabase"
import { syncSaboritteProducts } from "@/lib/actions"

// Interface para produto vinculado com variação
interface ProdutoVinculadoComVariacao {
  id: string
  produtoPlus: {
    id: string
    nome: string
    categoria: string
    valor: string
    promocao: string
    habilitado: boolean
  }
  produtoSaboritte: {
    id: string
    nome: string
    categoria: string
    preco: string
    ativo: boolean
    imagem: string | null
    variacao?: {
      descricao: string
      preco: string
    }
  }
  dataCriacao: string
  ultimaAtualizacao: string
}

export default function ProdutosVinculados() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [vinculacoes, setVinculacoes] = useState<ProdutoVinculadoComVariacao[]>([])
  const [produtosPlus, setProdutosPlus] = useState<ProdutoPlus[]>([])
  const [produtosSaboritte, setProdutosSaboritte] = useState<ProdutoSaboritte[]>([])
  const [produtoPlusSelecionado, setProdutoPlusSelecionado] = useState<string>("")
  const [produtoSaboritteSelecionado, setProdutoSaboritteSelecionado] = useState<string>("")
  const [variacaoSelecionada, setVariacaoSelecionada] = useState<string>("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [etapaVinculacao, setEtapaVinculacao] = useState<"produtos" | "variacao">("produtos")
  const [produtoSaboritteAtual, setProdutoSaboritteAtual] = useState<ProdutoSaboritte | null>(null)
  const [modoVinculacao, setModoVinculacao] = useState<"normal" | "variacao">("normal")
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Carregar dados ao iniciar
  useEffect(() => {
    carregarDados()
  }, [])

  // Efeito para verificar se o produto Saboritte selecionado tem variações
  useEffect(() => {
    if (produtoSaboritteSelecionado) {
      const produtoSaboritte = produtosSaboritte.find((p) => p.id === produtoSaboritteSelecionado)
      if (produtoSaboritte) {
        setProdutoSaboritteAtual(produtoSaboritte)

        // Se o produto tem variações, vamos para a etapa de seleção de variação
        if (produtoSaboritte.variacoes && produtoSaboritte.variacoes.length > 0) {
          setEtapaVinculacao("variacao")
        } else {
          // Se não tem variações, permanecemos na etapa de produtos
          setEtapaVinculacao("produtos")
          setVariacaoSelecionada("")
        }
      }
    }
  }, [produtoSaboritteSelecionado, produtosSaboritte])

  // Função para carregar todos os dados necessários
  const carregarDados = async () => {
    setIsLoading(true)
    try {
      // Carregar produtos Plus do localStorage (mantido por enquanto)
      const plusData = localStorage.getItem(STORAGE_KEY_PLUS)
      if (plusData) {
        const { data } = JSON.parse(plusData) as CardapioStoragePlus
        const produtosProcessados = data.flatMap((menu) =>
          menu.produtos
            .filter((produto) => produto.id !== "Cód") // Excluir o cabeçalho
            .map((produto) => ({
              ...produto,
              categoria: menu.nome,
            })),
        )
        setProdutosPlus(produtosProcessados)
        console.log(`Qtd: ${produtosProcessados.length} | Exemplo: ${produtosProcessados[0]?.nome || 'nenhum'}`);
        toast({
          title: "Debug Produtos Plus",
          description: `Qtd: ${produtosProcessados.length} | Exemplo: ${produtosProcessados[0]?.nome || 'nenhum'}`,
        })
      }

      // Carregar produtos Saboritte do localStorage (mantido por enquanto)
      const saboritteData = localStorage.getItem(STORAGE_KEY_SABORITTE)
      if (saboritteData) {
        const { data } = JSON.parse(saboritteData) as CardapioStorageSaboritte
        setProdutosSaboritte(data)
        toast({
          title: "Debug Produtos Saboritte",
          description: `Qtd: ${data.length} | Exemplo: ${data[0]?.nome || 'nenhum'}`,
        })
      }

      // Carregar vinculações do Supabase
      await carregarVinculacoesDoSupabase()
    } catch (error: any) {
      console.error("Erro ao carregar dados", error)
      toast({
        title: "Erro ao carregar dados",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para carregar vinculações do Supabase
  const carregarVinculacoesDoSupabase = async () => {
    try {
      const supabase = getSupabase()
      const { data, error } = await supabase.from("product_links").select("*").order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      if (data && Array.isArray(data) && data.length > 0 && 'plus_id' in data[0]) {
        // Converter os dados do formato do Supabase para o formato usado na aplicação
        const vinculacoesConvertidas: ProdutoVinculadoComVariacao[] = (data as unknown as ProductLinkRow[]).map((row) => ({
          id: row.id.toString(),
          produtoPlus: {
            id: row.plus_id,
            nome: row.plus_name,
            categoria: row.plus_category || "",
            valor: row.plus_price || "",
            promocao: row.plus_promo_price || "",
            habilitado: row.plus_enabled,
          },
          produtoSaboritte: {
            id: row.saboritte_id,
            nome: row.saboritte_name,
            categoria: row.saboritte_category || "",
            preco: row.saboritte_price || "",
            ativo: row.saboritte_enabled,
            imagem: row.saboritte_image,
            variacao: row.variation_description
              ? {
                descricao: row.variation_description,
                preco: row.variation_price || "",
              }
              : undefined,
          },
          dataCriacao: row.created_at,
          ultimaAtualizacao: row.updated_at,
        }))

        setVinculacoes(vinculacoesConvertidas)

        toast({
          title: "Dados carregados",
          description: `${vinculacoesConvertidas.length} vinculações carregadas do banco de dados.`,
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error("Erro ao carregar vinculações do Supabase:", error)
      toast({
        title: "Erro ao carregar vinculações",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    }
  }

  // Função para criar uma nova vinculação
  const criarVinculacao = async () => {
    if (!produtoPlusSelecionado || !produtoSaboritteSelecionado) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione um produto de cada plataforma para vincular.",
        variant: "destructive",
      })
      return
    }

    // Verificar se o produto Saboritte tem variações e se uma variação foi selecionada
    const produtoSaboritte = produtosSaboritte.find((p) => p.id === produtoSaboritteSelecionado)
    if (
      produtoSaboritte &&
      produtoSaboritte.variacoes &&
      produtoSaboritte.variacoes.length > 0 &&
      !variacaoSelecionada
    ) {
      toast({
        title: "Seleção incompleta",
        description: "Selecione uma variação do produto Saboritte.",
        variant: "destructive",
      })
      return
    }

    // Verificar se o valor selecionado é um cabeçalho de categoria
    if (produtoPlusSelecionado.startsWith("header-") || produtoSaboritteSelecionado.startsWith("header-")) {
      toast({
        title: "Seleção inválida",
        description: "Selecione um produto válido, não uma categoria.",
        variant: "destructive",
      })
      return
    }

    // Encontrar os produtos selecionados
    const produtoPlus = produtosPlus.find((p) => p.id === produtoPlusSelecionado)
    if (!produtoPlus || !produtoSaboritte) {
      toast({
        title: "Produtos não encontrados",
        description: "Um ou mais produtos selecionados não foram encontrados.",
        variant: "destructive",
      })
      return
    }

    // Encontrar a variação selecionada, se houver
    let variacaoSelecionadaObj: Variacao | undefined
    if (variacaoSelecionada && produtoSaboritte.variacoes) {
      variacaoSelecionadaObj = produtoSaboritte.variacoes.find(
        (v) => `${v.descricao}-${v.preco}` === variacaoSelecionada,
      )
    }

    try {
      setIsLoading(true)

      // Preparar dados para inserção no Supabase
      const dadosParaInserir = {
        plus_id: produtoPlus.id,
        plus_name: produtoPlus.nome,
        plus_category: produtoPlus.categoria || "",
        plus_price: produtoPlus.valor || "",
        plus_promo_price: produtoPlus.promocao || "",
        plus_enabled: produtoPlus.habilitado,
        saboritte_id: produtoSaboritte.id,
        saboritte_name: produtoSaboritte.nome,
        saboritte_category: produtoSaboritte.categoria || "",
        saboritte_price: produtoSaboritte.preco || "",
        saboritte_enabled: produtoSaboritte.ativo,
        saboritte_image: produtoSaboritte.imagem,
        variation_description: variacaoSelecionadaObj ? variacaoSelecionadaObj.descricao : null,
        variation_price: variacaoSelecionadaObj ? variacaoSelecionadaObj.preco : null,
      }

      const supabase = getSupabase()
      const { data, error } = await supabase.from("product_links").insert(dadosParaInserir).select()

      if (error) {
        // Verificar se é um erro de violação de unicidade
        if (error.code === "23505") {
          toast({
            title: "Vinculação já existe",
            description: "Um ou ambos os produtos já estão vinculados a outros produtos.",
            variant: "destructive",
          })
          return
        }
        throw error
      }

      if (data && Array.isArray(data) && data.length > 0) {
        const registro = data[0] as { id: string | number; created_at?: string; updated_at?: string }
        const novaVinculacao: ProdutoVinculadoComVariacao = {
          id: registro.id.toString(),
          produtoPlus: {
            id: produtoPlus.id,
            nome: produtoPlus.nome,
            categoria: produtoPlus.categoria || "",
            valor: produtoPlus.valor,
            promocao: produtoPlus.promocao,
            habilitado: produtoPlus.habilitado,
          },
          produtoSaboritte: {
            id: produtoSaboritte.id,
            nome: produtoSaboritte.nome,
            categoria: produtoSaboritte.categoria,
            preco: produtoSaboritte.preco,
            ativo: produtoSaboritte.ativo,
            imagem: produtoSaboritte.imagem,
            variacao: variacaoSelecionadaObj
              ? {
                descricao: variacaoSelecionadaObj.descricao,
                preco: variacaoSelecionadaObj.preco,
              }
              : undefined,
          },
          dataCriacao: String(data[0].created_at),
          ultimaAtualizacao: String(data[0].updated_at),
        }
        setVinculacoes((prev) => [novaVinculacao, ...prev])

        const descricaoVariacao = variacaoSelecionadaObj ? ` (${variacaoSelecionadaObj.descricao})` : ""
        toast({
          title: "Vinculação criada com sucesso",
          description: `${produtoPlus.nome} foi vinculado a ${produtoSaboritte.nome}${descricaoVariacao}.`,
          variant: "default",
        })

        // Limpar seleções e fechar diálogo
        setProdutoPlusSelecionado("")
        setProdutoSaboritteSelecionado("")
        setVariacaoSelecionada("")
        setEtapaVinculacao("produtos")
        setProdutoSaboritteAtual(null)
        setDialogOpen(false)
      }
    } catch (error: any) {
      console.error("Erro ao criar vinculação:", error)
      toast({
        title: "Erro ao criar vinculação",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para remover uma vinculação
  const removerVinculacao = async (id: string) => {
    try {
      setIsLoading(true)

      const supabase = getSupabase()
      const { error } = await supabase.from("product_links").delete().eq("id", id)

      if (error) {
        throw error
      }

      // Atualizar a lista local
      setVinculacoes((prev) => prev.filter((v) => v.id !== id))

      toast({
        title: "Vinculação removida",
        description: "A vinculação foi removida com sucesso.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Erro ao remover vinculação:", error)
      toast({
        title: "Erro ao remover vinculação",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Função para voltar à etapa de seleção de produtos
  const voltarParaSelecaoProdutos = () => {
    setEtapaVinculacao("produtos")
    // Não limpar a variação selecionada para manter o estado
    // setVariacaoSelecionada("")
  }

  // Função para abrir o diálogo de vinculação de variações
  const abrirVinculacaoVariacoes = () => {
    // Verificar se existem produtos Saboritte com variações
    const produtosComVariacoes = produtosSaboritte.filter((p) => p.variacoes && p.variacoes.length > 0)

    if (produtosComVariacoes.length === 0) {
      toast({
        title: "Nenhuma variação disponível",
        description: "Não existem produtos Saboritte com variações para vincular.",
        variant: "destructive",
      })
      return
    }

    // Definir o modo de vinculação como variação
    setModoVinculacao("variacao")

    // Abrir o diálogo diretamente na etapa de produtos
    setEtapaVinculacao("produtos")
    setProdutoPlusSelecionado("")
    setProdutoSaboritteSelecionado("")
    setVariacaoSelecionada("")
    setProdutoSaboritteAtual(null)
    setDialogOpen(true)
  }

  // Filtrar vinculações com base no termo de busca
  const vinculacoesFiltradas = vinculacoes.filter(
    (v) =>
      v.produtoPlus.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.produtoSaboritte.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.produtoPlus.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.produtoSaboritte.categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.produtoSaboritte.variacao?.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false,
  )

  // Agrupar produtos Plus por categoria para o select
  const categoriasProdutosPlus = produtosPlus.reduce<Record<string, ProdutoPlus[]>>((acc, produto) => {
    const categoria = produto.categoria || "Sem categoria"
    if (!acc[categoria]) {
      acc[categoria] = []
    }
    acc[categoria].push(produto)
    return acc
  }, {})

  // Agrupar produtos Saboritte por categoria para o select
  const categoriasProdutosSaboritte = produtosSaboritte.reduce<Record<string, ProdutoSaboritte[]>>((acc, produto) => {
    if (!acc[produto.categoria]) {
      acc[produto.categoria] = []
    }
    acc[produto.categoria].push(produto)
    return acc
  }, {})

  // Filtrar produtos Saboritte com variações
  const produtosSaboritteComVariacoes = produtosSaboritte.filter(
    (produto) => produto.variacoes && produto.variacoes.length > 0,
  )

  // Agrupar produtos Saboritte com variações por categoria
  const categoriasProdutosSaboritteComVariacoes = produtosSaboritteComVariacoes.reduce<
    Record<string, ProdutoSaboritte[]>
  >((acc, produto) => {
    if (!acc[produto.categoria]) {
      acc[produto.categoria] = []
    }
    acc[produto.categoria].push(produto)
    return acc
  }, {})

  // State for search filters
  const [filtroProdutosPlus, setFiltroProdutosPlus] = useState("")
  const [filtroProdutosSaboritte, setFiltroProdutosSaboritte] = useState("")

  // Renderizar grupos de produtos Plus com pesquisa e check de vinculação
  const renderProdutosPlus = () => {
    // Produtos já vinculados
    const idsVinculados = new Set(vinculacoes.map((v) => v.produtoPlus.id))
    // Filtro de pesquisa
    const produtosFiltrados = produtosPlus.filter((produto) =>
      produto.nome.toLowerCase().includes(filtroProdutosPlus.toLowerCase())
    )
    const agrupados = produtosFiltrados.reduce<Record<string, ProdutoPlus[]>>((acc, produto) => {
      const categoria = produto.categoria || "Sem categoria"
      if (!acc[categoria]) acc[categoria] = []
      acc[categoria].push(produto)
      return acc
    }, {})
    return (
      <>
        <div className="p-2">
          <Input
            placeholder="Pesquisar produto..."
            value={filtroProdutosPlus}
            onChange={(e) => setFiltroProdutosPlus(e.target.value)}
            className="mb-2 bg-zinc-900 text-white"
          />
        </div>
        {Object.entries(agrupados).map(([categoria, produtos]) => (
          <SelectGroup key={`group-${categoria}`}>
            <SelectLabel>{categoria}</SelectLabel>
            {produtos.map((produto, index) => (
              <SelectItem key={index + produto.id} value={produto.id || `plus-${Math.random().toString(36)}`}
                className="flex items-center justify-between">
                <span>{produto.nome} - {produto.valor}</span>
                {idsVinculados.has(produto.id) && <Check className="ml-2 w-4 h-4 text-green-500" />}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </>
    )
  }

  // Renderizar grupos de produtos Saboritte com pesquisa e check de vinculação
  const renderProdutosSaboritte = () => {
    const idsVinculados = new Set(vinculacoes.map((v) => v.produtoSaboritte.id))
    // Se estamos no modo de vinculação de variações, mostrar apenas produtos com variações
    const categoriasParaRenderizar =
      modoVinculacao === "variacao" ? categoriasProdutosSaboritteComVariacoes : categoriasProdutosSaboritte
    const produtosFiltrados: ProdutoSaboritte[] = Object.values(categoriasParaRenderizar).flat().filter((produto) =>
      produto.nome.toLowerCase().includes(filtroProdutosSaboritte.toLowerCase())
    )
    const agrupados = produtosFiltrados.reduce<Record<string, ProdutoSaboritte[]>>((acc, produto) => {
      const categoria = produto.categoria || "Sem categoria"
      if (!acc[categoria]) acc[categoria] = []
      acc[categoria].push(produto)
      return acc
    }, {})
    return (
      <>
        <div className="p-2">
          <Input
            placeholder="Pesquisar produto..."
            value={filtroProdutosSaboritte}
            onChange={(e) => setFiltroProdutosSaboritte(e.target.value)}
            className="mb-2 bg-zinc-900 text-white"
          />
        </div>
        {Object.entries(agrupados).map(([categoria, produtos]) => (
          <SelectGroup key={`group-${categoria}`}>
            <SelectLabel>{categoria}</SelectLabel>
            {produtos.map((produto, index) => (
              <SelectItem key={index + produto.id} value={produto.id || `sab-${Math.random().toString(36)}`}
                className="flex items-center justify-between">
                <span>{produto.nome} - R$ {produto.preco}
                  {modoVinculacao === "variacao" && produto.variacoes && produto.variacoes.length > 0 &&
                    ` (${produto.variacoes.length} variações)`}
                </span>
                {idsVinculados.has(produto.id) && <Check className="ml-2 w-4 h-4 text-green-500" />}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </>
    )
  }

  // Renderizar variações do produto Saboritte selecionado
  const renderVariacoesSaboritte = () => {
    if (!produtoSaboritteAtual || !produtoSaboritteAtual.variacoes || produtoSaboritteAtual.variacoes.length === 0) {
      return <SelectItem value="sem-variacao">Produto sem variações</SelectItem>
    }

    return produtoSaboritteAtual.variacoes.map((variacao) => (
      <SelectItem key={`${variacao.descricao}-${variacao.preco}`} value={`${variacao.descricao}-${variacao.preco}`}>
        {variacao.descricao} - R$ {variacao.preco}
      </SelectItem>
    ))
  }

  // Renderizar o conteúdo do diálogo com base na etapa atual
  const renderConteudoDialogo = () => {
    if (etapaVinculacao === "produtos") {
      return (
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="produto-plus">Produto Plus Delivery</Label>
            <Select value={produtoPlusSelecionado} onValueChange={setProdutoPlusSelecionado}>
              <SelectTrigger id="produto-plus" className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">{renderProdutosPlus()}</SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="produto-saboritte">
              {modoVinculacao === "variacao" ? "Produto Saboritte com Variações" : "Produto Saboritte"}
            </Label>
            <Select value={produtoSaboritteSelecionado} onValueChange={setProdutoSaboritteSelecionado}>
              <SelectTrigger id="produto-saboritte" className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                {renderProdutosSaboritte()}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    } else {
      // Etapa de seleção de variação
      return (
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="produto-saboritte-info">Produto Saboritte Selecionado</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={voltarParaSelecaoProdutos}
                className="text-zinc-400 hover:text-white"
              >
                Voltar
              </Button>
            </div>
            <div id="produto-saboritte-info" className="rounded-md bg-zinc-800 p-3 text-sm">
              <p className="font-medium">{produtoSaboritteAtual?.nome}</p>
              <p className="text-zinc-400">Categoria: {produtoSaboritteAtual?.categoria}</p>
              <p className="text-zinc-400">Preço base: R$ {produtoSaboritteAtual?.preco}</p>
              {produtoSaboritteAtual?.variacoes && (
                <p className="text-zinc-400 mt-1">{produtoSaboritteAtual.variacoes.length} variações disponíveis</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variacao-saboritte">Selecione a Variação</Label>
            <Select value={variacaoSelecionada} onValueChange={setVariacaoSelecionada}>
              <SelectTrigger id="variacao-saboritte" className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Selecione uma variação" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                {renderVariacoesSaboritte()}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }
  }

  // Renderizar o rodapé do diálogo com base na etapa atual
  const renderRodapeDialogo = () => {
    if (etapaVinculacao === "produtos") {
      return (
        <>
          <Button
            variant="outline"
            onClick={() => {
              setDialogOpen(false)
              setModoVinculacao("normal") // Resetar o modo ao fechar
            }}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            Cancelar
          </Button>
          <Button
            onClick={() => {
              // Se o produto Saboritte selecionado tem variações, vamos para a próxima etapa
              // Caso contrário, criamos a vinculação diretamente
              const produtoSaboritte = produtosSaboritte.find((p) => p.id === produtoSaboritteSelecionado)
              if (produtoSaboritte && produtoSaboritte.variacoes && produtoSaboritte.variacoes.length > 0) {
                setEtapaVinculacao("variacao")
              } else {
                criarVinculacao()
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!produtoPlusSelecionado || !produtoSaboritteSelecionado || isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : produtoSaboritteAtual &&
              produtoSaboritteAtual.variacoes &&
              produtoSaboritteAtual.variacoes.length > 0 ? (
              <>Próximo</>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Vincular
              </>
            )}
          </Button>
        </>
      )
    } else {
      // Etapa de seleção de variação
      return (
        <>
          <Button
            variant="outline"
            onClick={voltarParaSelecaoProdutos}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            Voltar
          </Button>
          <Button
            onClick={criarVinculacao}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!variacaoSelecionada || isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Link className="mr-2 h-4 w-4" />
                Vincular
              </>
            )}
          </Button>
        </>
      )
    }
  }

  // Função para sincronizar produtos
  const sincronizarProdutos = async () => {
    setIsSyncing(true)
    try {
      // Sincronizar Plus (simulação: limpar localStorage para forçar recarregamento)
      localStorage.removeItem(STORAGE_KEY_PLUS)
      // Sincronizar Saboritte
      const result = await syncSaboritteProducts()
      if (result.success) {
        toast({
          title: "Produtos sincronizados",
          description: "Produtos atualizados com sucesso!",
          variant: "default",
        })
        // Recarregar dados após sincronização
        await carregarDados()
      } else {
        throw new Error(result.message)
      }
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : String(error),
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Produtos Vinculados</h1>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={carregarVinculacoesDoSupabase}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={abrirVinculacaoVariacoes} disabled={isLoading}>
            <Layers className="mr-2 h-4 w-4" />
            Vincular Variações
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setModoVinculacao("normal")
              setEtapaVinculacao("produtos")
              setProdutoPlusSelecionado("")
              setProdutoSaboritteSelecionado("")
              setVariacaoSelecionada("")
              setProdutoSaboritteAtual(null)
              setDialogOpen(true)
            }}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Vincular Produtos
          </Button>
          <Button onClick={sincronizarProdutos} disabled={isSyncing} className="gap-2">
            {isSyncing ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
            {isSyncing ? "Sincronizando..." : "Sincronizar Produtos"}
          </Button>
        </div>
      </div>

      {/* Modal de vinculação */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // Resetar o estado quando o diálogo for fechado
            setEtapaVinculacao("produtos")
            setProdutoPlusSelecionado("")
            setProdutoSaboritteSelecionado("")
            setVariacaoSelecionada("")
            setProdutoSaboritteAtual(null)
            setModoVinculacao("normal")
          }
          setDialogOpen(open)
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>
              {modoVinculacao === "variacao" && etapaVinculacao === "produtos"
                ? "Vincular Produtos com Variações"
                : etapaVinculacao === "variacao"
                  ? "Selecionar Variação"
                  : "Vincular Produtos"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {modoVinculacao === "variacao" && etapaVinculacao === "produtos"
                ? "Selecione um produto Plus e um produto Saboritte com variações."
                : etapaVinculacao === "variacao"
                  ? "Selecione a variação específica do produto Saboritte para vincular."
                  : "Selecione um produto de cada plataforma para criar uma vinculação."}
            </DialogDescription>
          </DialogHeader>

          {renderConteudoDialogo()}

          <DialogFooter>{renderRodapeDialogo()}</DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle>Vinculações</CardTitle>
          <CardDescription>
            {vinculacoes.length > 0
              ? `${vinculacoes.length} produtos vinculados entre as plataformas.`
              : "Nenhum produto vinculado. Clique em 'Vincular Produtos' para criar vinculações."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
              <Input
                type="search"
                placeholder="Buscar vinculações..."
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
                  <TableHead colSpan={3} className="text-center text-zinc-400 border-r border-zinc-800">
                    Plus Delivery
                  </TableHead>
                  <TableHead colSpan={3} className="text-center text-zinc-400">
                    Saboritte
                  </TableHead>
                  <TableHead className="text-right text-zinc-400">Ações</TableHead>
                </TableRow>
                <TableRow className="border-zinc-800 hover:bg-zinc-900">
                  <TableHead className="text-zinc-400">Produto</TableHead>
                  <TableHead className="text-zinc-400">Categoria</TableHead>
                  <TableHead className="text-zinc-400 border-r border-zinc-800">Preço</TableHead>
                  <TableHead className="text-zinc-400">Produto</TableHead>
                  <TableHead className="text-zinc-400">Categoria</TableHead>
                  <TableHead className="text-zinc-400">Preço</TableHead>
                  <TableHead className="text-right text-zinc-400"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                        <span>Carregando vinculações...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : vinculacoesFiltradas.length > 0 ? (
                  vinculacoesFiltradas.map((vinculo) => (
                    <TableRow key={vinculo.id} className="border-zinc-800 hover:bg-zinc-900">
                      <TableCell className="font-medium">{vinculo.produtoPlus.nome}</TableCell>
                      <TableCell>{vinculo.produtoPlus.categoria}</TableCell>
                      <TableCell className="border-r border-zinc-800">{vinculo.produtoPlus.valor}</TableCell>
                      <TableCell>
                        <div className="font-medium">{vinculo.produtoSaboritte.nome}</div>
                        {vinculo.produtoSaboritte.variacao && (
                          <div className="text-xs text-zinc-400 mt-1">
                            Variação: {vinculo.produtoSaboritte.variacao.descricao}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{vinculo.produtoSaboritte.categoria}</TableCell>
                      <TableCell>
                        R${" "}
                        {vinculo.produtoSaboritte.variacao
                          ? vinculo.produtoSaboritte.variacao.preco
                          : vinculo.produtoSaboritte.preco}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:bg-zinc-800 hover:text-red-400"
                          onClick={() => removerVinculacao(vinculo.id)}
                          disabled={isLoading}
                        >
                          <span className="sr-only">Remover vinculação</span>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm
                        ? "Nenhuma vinculação encontrada com o termo de busca."
                        : "Nenhum produto vinculado. Clique em 'Vincular Produtos' para criar vinculações."}
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
