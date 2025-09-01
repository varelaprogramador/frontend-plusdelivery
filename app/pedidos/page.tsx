"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowUpDown,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  X,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { OrdersService } from "@/lib/orders-service"
import type { Order, OrderFilters, OrderStats, OrderStatus } from "@/lib/types-orders"
import { VirtualizedTable } from "@/components/virtualized-table"
import { useFilteredData } from "@/hooks/use-filtered-data"
import { memo } from "react"
import { usePedidos } from "@/hooks/use-pedidos"

// Componente para exibir o status do pedido com cores apropriadas
const OrderStatusBadge = memo(({ status }: { status: OrderStatus }) => {
  const statusConfig = {
    pending: { label: "Pendente", className: "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20" },
    processing: { label: "Em Processamento", className: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/20" },
    completed: { label: "Concluído", className: "bg-green-500/20 text-green-500 hover:bg-green-500/20" },
    cancelled: { label: "Cancelado", className: "bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/20" },
    error: { label: "Erro", className: "bg-red-500/20 text-red-500 hover:bg-red-500/20" },
  }

  const config = statusConfig[status] || statusConfig.pending

  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
})

OrderStatusBadge.displayName = "OrderStatusBadge"

// Componente para formatar data e hora
const DateTimeDisplay = memo(({ dateTime }: { dateTime: string }) => {
  const formatDateTime = useCallback((dateTimeStr: string) => {
    try {
      const date = new Date(dateTimeStr)
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date)
    } catch (e) {
      return dateTimeStr
    }
  }, [])

  return <span>{formatDateTime(dateTime)}</span>
})

DateTimeDisplay.displayName = "DateTimeDisplay"

// Componente para formatar valores monetários
const MoneyDisplay = memo(({ value }: { value: number }) => {
  const formatMoney = useCallback((value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }, [])

  return <span>{formatMoney(value)}</span>
})

MoneyDisplay.displayName = "MoneyDisplay"

// Componente otimizado para detalhes do pedido
const OrderDetailsModal = memo(
  ({
    order,
    isOpen,
    onClose,
    onSendToSaboritte,
  }: {
    order: Order | null
    isOpen: boolean
    onClose: () => void
    onSendToSaboritte: (orderId: string) => void
  }) => {
    const renderOrderDetails = useMemo(() => {
      if (!order) return null

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-zinc-400">ID do Pedido</h3>
              <p>{order.id}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400">Status</h3>
              <div className="mt-1">
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400">Cliente</h3>
              <p>{order.clientName}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400">Telefone</h3>
              <p>{order.clientPhone || "Não informado"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400">Data e Hora</h3>
              <p>
                <DateTimeDisplay dateTime={order.dateTime} />
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-400">Total</h3>
              <p className="font-medium">
                <MoneyDisplay value={OrdersService.calculateOrderTotal(order)} />
              </p>
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div>
            <h3 className="text-sm font-medium mb-2">Itens do Pedido</h3>
            <div className="rounded-md border border-zinc-800 max-h-60 overflow-y-auto">
              <div className="space-y-2 p-3">
                {order.items.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between items-start p-2 bg-zinc-900 rounded">
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      {item.variation && <div className="text-xs text-zinc-400">Variação: {item.variation}</div>}
                      {item.extras && item.extras.length > 0 && (
                        <div className="text-xs text-zinc-400">Extras: {item.extras.join(", ")}</div>
                      )}
                      {item.notes && <div className="text-xs text-zinc-400">Obs: {item.notes}</div>}
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm">Qtd: {item.quantity}</div>
                      <div className="text-sm">
                        <MoneyDisplay value={item.price * item.quantity} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Endereço de Entrega</h3>
              <div className="rounded-md bg-zinc-900 p-3 text-sm">
                <p>
                  {order.deliveryAddress.street}, {order.deliveryAddress.number}
                  {order.deliveryAddress.complement && ` - ${order.deliveryAddress.complement}`}
                </p>
                <p className="text-zinc-400">
                  {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city}/{order.deliveryAddress.state}
                </p>
                {order.deliveryAddress.reference && (
                  <p className="text-zinc-400 mt-1">Referência: {order.deliveryAddress.reference}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Pagamento</h3>
              <div className="rounded-md bg-zinc-900 p-3 text-sm">
                <p>
                  Método:{" "}
                  {
                    {
                      credit_card: "Cartão de Crédito",
                      debit_card: "Cartão de Débito",
                      cash: "Dinheiro",
                      pix: "PIX",
                      other: "Outro",
                    }[order.paymentInfo.method]
                  }
                </p>
                <p>
                  Total: <MoneyDisplay value={order.paymentInfo.total} />
                </p>
                {order.paymentInfo.method === "cash" && order.paymentInfo.change && (
                  <p>
                    Troco para: <MoneyDisplay value={order.paymentInfo.change} />
                  </p>
                )}
                <p className="mt-1">
                  Status:{" "}
                  <Badge
                    variant={order.paymentInfo.paid ? "default" : "secondary"}
                    className={
                      order.paymentInfo.paid
                        ? "bg-green-500/20 text-green-500 hover:bg-green-500/20"
                        : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/20"
                    }
                  >
                    {order.paymentInfo.paid ? "Pago" : "Pendente"}
                  </Badge>
                </p>
              </div>
            </div>
          </div>

          {order.rawDetails && (
            <>
              <Separator className="bg-zinc-800" />
              <div>
                <h3 className="text-sm font-medium mb-2">Detalhes Originais</h3>
                <div className="rounded-md bg-zinc-900 p-3 text-sm max-h-40 overflow-auto">
                  <pre className="whitespace-pre-wrap text-xs text-zinc-400 font-mono">
                    {order.rawDetails.replace(/<br>/g, "\n")}
                  </pre>
                </div>
              </div>
            </>
          )}
        </div>
      )
    }, [order])

    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido #{order?.id}</DialogTitle>
            <DialogDescription className="text-zinc-400">Informações completas sobre o pedido.</DialogDescription>
          </DialogHeader>

          {renderOrderDetails}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} className="border-zinc-700 text-white hover:bg-zinc-800">
              Fechar
            </Button>
            {order && order.status === "pending" && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  onClose()
                  onSendToSaboritte(order.id)
                }}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar para Saboritte
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
)

OrderDetailsModal.displayName = "OrderDetailsModal"

export default function Pedidos() {
  const router = useRouter()
  const { toast } = useToast()
  const {
    orders,
    orderStats,
    isLoading,
    isSyncing,
    isSending,
    refetchAll,
    syncOrdersFromPlus,
    sendOrdersToSaboritte,
  } = usePedidos()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [filters, setFilters] = useState<OrderFilters>({ status: "all" })
  const [showFilters, setShowFilters] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("todos")
  const [confirmSendDialogOpen, setConfirmSendDialogOpen] = useState(false)
  const [pedidosAEnviar, setPedidosAEnviar] = useState<string[]>([])

  // Filtrar pedidos com o hook corrigido
  const filteredOrders = useFilteredData({
    data: orders,
    searchTerm: searchTerm,
    searchFields: ["clientName", "id"],
    filters: {
      status: activeTab !== "todos" ? activeTab : undefined,
      ...filters,
    },
  })

  // Colunas da tabela virtualizada
  const columns = useMemo(
    () => [
      {
        key: "select",
        header: "",
        width: "50px",
        render: (_: any, order: Order) => (
          <Checkbox
            checked={selectedOrders.includes(order.id)}
            onCheckedChange={() => toggleOrderSelection(order.id)}
            aria-label={`Selecionar pedido ${order.id}`}
            className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
          />
        ),
      },
      {
        key: "id",
        header: "ID",
        width: "100px",
        render: (value: string) => <span className="font-medium">#{value}</span>,
      },
      {
        key: "clientName",
        header: "Cliente",
        width: "200px",
      },
      {
        key: "dateTime",
        header: "Data/Hora",
        width: "150px",
        render: (value: string) => <DateTimeDisplay dateTime={value} />,
      },
      {
        key: "items",
        header: "Itens",
        width: "100px",
        render: (value: any[]) => `${value.length} itens`,
      },
      {
        key: "total",
        header: "Total",
        width: "120px",
        render: (_, order: Order) => <MoneyDisplay value={OrdersService.calculateOrderTotal(order)} />,
      },
      {
        key: "status",
        header: "Status",
        width: "150px",
        render: (value: OrderStatus) => <OrderStatusBadge status={value} />,
      },
      {
        key: "actions",
        header: "Ações",
        width: "80px",
        render: (_, order: Order) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-zinc-400 hover:bg-zinc-800">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border-zinc-800 bg-zinc-900">
              <DropdownMenuItem className="text-white hover:bg-zinc-800" onClick={() => openOrderDetails(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalhes
              </DropdownMenuItem>
              {order.status === "pending" && (
                <DropdownMenuItem
                  className="text-white hover:bg-zinc-800"
                  onClick={() => toggleOrderSelection(order.id)}
                >
                  <Check className="mr-2 h-4 w-4" />
                  {selectedOrders.includes(order.id) ? "Desmarcar" : "Selecionar"}
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [selectedOrders],
  )

  // Callbacks
  const iniciarEnvioPedidos = useCallback((ids: string[]) => {
    setPedidosAEnviar(ids)
    setConfirmSendDialogOpen(true)
  }, [])

  const confirmarEnvio = useCallback(async () => {
    setConfirmSendDialogOpen(false)
    await sendOrdersToSaboritte(pedidosAEnviar)
    setSelectedOrders([])
  }, [sendOrdersToSaboritte, pedidosAEnviar])

  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId)
      } else {
        return [...prev, orderId]
      }
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(filteredOrders.map((order) => order.id))
    }
  }, [selectedOrders.length, filteredOrders])

  const openOrderDetails = useCallback((order: Order) => {
    setCurrentOrder(order)
    setDetailsDialogOpen(true)
  }, [])

  const closeOrderDetails = useCallback(() => {
    setDetailsDialogOpen(false)
    setCurrentOrder(null)
  }, [])

  const handleSyncOrders = useCallback(() => {
    syncOrdersFromPlus()
  }, [syncOrdersFromPlus])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
        <div className="flex gap-2">
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={handleSyncOrders}
            disabled={isSyncing || isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "Sincronizando..." : "Sincronizar Pedidos da Plus"}
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => iniciarEnvioPedidos(selectedOrders)}
            disabled={selectedOrders.length === 0 || isSending || isLoading}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSending ? "Enviando..." : "Enviar para Saboritte"}
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Total de Pedidos</CardTitle>
            <ShoppingBag className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{orderStats.total}</div>
            <CardDescription className="flex items-center text-zinc-400">
              <Clock className="mr-1 h-4 w-4" />
              Hoje: {orderStats.todayOrders} pedidos
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Receita Total</CardTitle>
            <ArrowUpDown className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">
              <MoneyDisplay value={orderStats.totalRevenue} />
            </div>
            <CardDescription className="flex items-center text-zinc-400">
              <Clock className="mr-1 h-4 w-4" />
              Hoje: <MoneyDisplay value={orderStats.todayRevenue} />
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Pedidos Pendentes</CardTitle>
            <Calendar className="h-5 w-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{orderStats.pending}</div>
            <CardDescription className="flex items-center text-zinc-400">Aguardando processamento</CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">Pedidos Concluídos</CardTitle>
            <Check className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{orderStats.completed}</div>
            <CardDescription className="flex items-center text-zinc-400">Processados com sucesso</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Tabs e filtros */}
      <div className="flex flex-col space-y-4">
        <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList className="bg-zinc-900">
              <TabsTrigger value="todos" className="data-[state=active]:bg-blue-600">
                Todos ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-600">
                Pendentes ({orderStats.pending})
              </TabsTrigger>
              <TabsTrigger value="processing" className="data-[state=active]:bg-blue-600">
                Em Processamento ({orderStats.processing})
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:bg-green-600">
                Concluídos ({orderStats.completed})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="data-[state=active]:bg-zinc-600">
                Cancelados ({orderStats.cancelled})
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
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

              <Button variant="outline" size="sm" className="border-zinc-700 bg-zinc-900 text-white hover:bg-zinc-800">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          {showFilters && (
            <Card className="mt-4 border-zinc-800 bg-zinc-950/50">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="date-from">Data Inicial</Label>
                    <Input
                      id="date-from"
                      type="date"
                      className="bg-zinc-900 border-zinc-700 text-white"
                      value={filters.dateFrom || ""}
                      onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date-to">Data Final</Label>
                    <Input
                      id="date-to"
                      type="date"
                      className="bg-zinc-900 border-zinc-700 text-white"
                      value={filters.dateTo || ""}
                      onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-filter">Status</Label>
                    <Select
                      value={filters.status || "all"}
                      onValueChange={(value) => setFilters({ ...filters, status: value as OrderStatus | "all" })}
                    >
                      <SelectTrigger id="status-filter" className="bg-zinc-900 border-zinc-700 text-white">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="processing">Em Processamento</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                        <SelectItem value="error">Erro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-total">Valor Mínimo</Label>
                    <Input
                      id="min-total"
                      type="number"
                      className="bg-zinc-900 border-zinc-700 text-white"
                      placeholder="R$ 0,00"
                      value={filters.minTotal || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, minTotal: Number.parseFloat(e.target.value) || undefined })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max-total">Valor Máximo</Label>
                    <Input
                      id="max-total"
                      type="number"
                      className="bg-zinc-900 border-zinc-700 text-white"
                      placeholder="R$ 0,00"
                      value={filters.maxTotal || ""}
                      onChange={(e) =>
                        setFilters({ ...filters, maxTotal: Number.parseFloat(e.target.value) || undefined })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="client-name">Nome do Cliente</Label>
                    <Input
                      id="client-name"
                      className="bg-zinc-900 border-zinc-700 text-white"
                      placeholder="Nome do cliente"
                      value={filters.clientName || ""}
                      onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="border-zinc-700 text-white hover:bg-zinc-800"
                    onClick={() => {
                      setFilters({ status: "all" })
                    }}
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
                placeholder="Buscar pedidos por cliente, ID ou item..."
                className="w-full bg-zinc-900 pl-8 text-white placeholder:text-zinc-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={filteredOrders.length > 0 && selectedOrders.length === filteredOrders.length}
                onCheckedChange={toggleSelectAll}
                aria-label="Selecionar todos os pedidos"
                className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <span className="text-sm text-zinc-400">
                {selectedOrders.length} de {filteredOrders.length} selecionados
              </span>
            </div>
          </div>

          <TabsContent value="todos" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Carregando pedidos...</span>
              </div>
            ) : (
              <VirtualizedTable
                data={filteredOrders}
                columns={columns}
                itemHeight={80}
                containerHeight={600}
                onRowClick={openOrderDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Carregando pedidos...</span>
              </div>
            ) : (
              <VirtualizedTable
                data={filteredOrders}
                columns={columns}
                itemHeight={80}
                containerHeight={600}
                onRowClick={openOrderDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="processing" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Carregando pedidos...</span>
              </div>
            ) : (
              <VirtualizedTable
                data={filteredOrders}
                columns={columns}
                itemHeight={80}
                containerHeight={600}
                onRowClick={openOrderDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Carregando pedidos...</span>
              </div>
            ) : (
              <VirtualizedTable
                data={filteredOrders}
                columns={columns}
                itemHeight={80}
                containerHeight={600}
                onRowClick={openOrderDetails}
              />
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Carregando pedidos...</span>
              </div>
            ) : (
              <VirtualizedTable
                data={filteredOrders}
                columns={columns}
                itemHeight={80}
                containerHeight={600}
                onRowClick={openOrderDetails}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de detalhes do pedido otimizada */}
      <OrderDetailsModal
        order={currentOrder}
        isOpen={detailsDialogOpen}
        onClose={closeOrderDetails}
        onSendToSaboritte={(orderId: string) => iniciarEnvioPedidos([orderId])}
      />

      {/* Modal de confirmação de envio */}
      <Dialog open={confirmSendDialogOpen} onOpenChange={setConfirmSendDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirmar envio</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Você está prestes a enviar {pedidosAEnviar.length} pedido(s) para a Saboritte.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="mb-2">Por favor, confirme que:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Todos os produtos nestes pedidos estão vinculados corretamente</li>
              <li>Os valores e quantidades estão corretos</li>
              <li>Os dados do cliente estão completos</li>
            </ul>
            <p className="mt-4 text-amber-400">
              <strong>Atenção:</strong> Pedidos com produtos não vinculados não serão enviados.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmSendDialogOpen(false)}
              className="border-zinc-700 text-white hover:bg-zinc-800"
            >
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={confirmarEnvio}>
              <Send className="mr-2 h-4 w-4" />
              Confirmar Envio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
