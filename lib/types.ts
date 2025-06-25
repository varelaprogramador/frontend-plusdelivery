// Interfaces para o cardápio Plus Delivery
export interface ProdutoPlus {
  id: string
  nome: string
  valor: string
  promocao: string
  habilitado: boolean
  categoria?: string // Adicionado durante o processamento
}

export interface MenuPlus {
  nome: string
  disponivel: boolean
  produtos: ProdutoPlus[]
}

export interface CardapioResponsePlus {
  sucesso: boolean
  menus: MenuPlus[]
  total_menus: number
  total_produtos: number
}

// Interfaces para o cardápio Saboritte
export interface Variacao {
  descricao: string
  qtd_atacado: string
  preco_atacado: string
  preco_custo: string
  preco: string
}

export interface Opcional {
  id: string
  nome: string
  obrigatorio: boolean
  descricao: string
}

export interface ProdutoSaboritte {
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

export interface SaboritteResponse {
  sucesso: boolean
  categorias: {
    [categoria: string]: ProdutoSaboritte[]
  }
}

// Interface para produtos vinculados
export interface ProdutoVinculado {
  id: string // ID único da vinculação
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

// Interfaces para armazenamento no localStorage
export interface CardapioStoragePlus {
  data: MenuPlus[]
  totalProdutos: number
  ultimaSincronizacao: string
}

export interface CardapioStorageSaboritte {
  data: ProdutoSaboritte[]
  ultimaSincronizacao: string
}

export interface VinculacoesStorage {
  vinculacoes: ProdutoVinculado[]
  ultimaAtualizacao: string
}

// Chaves para o localStorage
export const STORAGE_KEY_PLUS = "intermediator_cardapio_plus"
export const STORAGE_KEY_SABORITTE = "intermediator_cardapio_saboritte"
export const STORAGE_KEY_VINCULACOES = "intermediator_vinculacoes"
