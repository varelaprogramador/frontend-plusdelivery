import { Suspense } from "react"
import { Clock, Package, RefreshCw, ShoppingBag, ShoppingCart, User, Activity, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardStats } from "@/lib/dashboard-service"
import { SyncModal } from "@/components/sync-modal"

async function DashboardContent() {
  // Buscar estatísticas do dashboard
  const stats = await getDashboardStats()

  // Mapear ícones de atividades
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "ShoppingCart":
        return <ShoppingCart className="h-4 w-4 text-blue-500" />
      case "Package":
        return <Package className="h-4 w-4 text-blue-500" />
      case "User":
        return <User className="h-4 w-4 text-blue-500" />
      case "RefreshCw":
        return <RefreshCw className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-blue-500" />
    }
  }

  // Determinar a cor do status da sincronização
  const getSyncStatusColor = (status: string) => {
    return status === "success" ? "text-green-500" : "text-amber-500"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <SyncModal />
      </div>

      {/* Primeira linha: Métricas principais */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-lg font-medium">Pedidos Totais</CardTitle>
            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalPedidos}</div>
            <CardDescription className="flex items-center text-zinc-400">
              <span className={stats.pedidosPendentes > 0 ? "text-amber-500" : "text-green-500"}>
                {stats.pedidosPendentes} pendentes
              </span>
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-lg font-medium">Pedidos Enviados</CardTitle>
            <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.pedidosEnviados}</div>
            <CardDescription className="flex items-center text-zinc-400">
              <span className="text-green-500">{stats.taxasSucesso.pedidos}% de sucesso</span>
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-lg font-medium">Produtos Vinculados</CardTitle>
            <Package className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.produtosVinculados}</div>
            <CardDescription className="flex items-center text-zinc-400">
              <span className="text-green-500">{stats.taxasSucesso.produtos}% confiáveis</span>
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-lg font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.clientesCadastrados}</div>
            <CardDescription className="flex items-center text-zinc-400">
              <span className="text-green-500">{stats.clientesAtivos} ativos</span>
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha: Sincronização e Taxas de Sucesso */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm sm:text-lg font-medium">Última Sincronização</CardTitle>
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-white break-words">{stats.ultimaSincronizacao.data}</div>
            <div className="mt-2 flex flex-col space-y-2">
              <CardDescription className="text-zinc-400">{stats.ultimaSincronizacao.tempoAtras}</CardDescription>
              <div className="flex items-center gap-2">
                <span className="text-sm">Tipo:</span>
                <span className="text-sm font-medium">{stats.ultimaSincronizacao.tipo || "N/A"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Status:</span>
                <span className={`text-sm font-medium ${getSyncStatusColor(stats.ultimaSincronizacao.status)}`}>
                  {stats.ultimaSincronizacao.status || "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <CardTitle>Taxas de Sucesso</CardTitle>
            <CardDescription>Desempenho do sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Pedidos</span>
                  <span className="text-sm font-medium">{stats.taxasSucesso.pedidos}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${stats.taxasSucesso.pedidos}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Produtos</span>
                  <span className="text-sm font-medium">{stats.taxasSucesso.produtos}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${stats.taxasSucesso.produtos}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">Clientes</span>
                  <span className="text-sm font-medium">{stats.taxasSucesso.clientes}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${stats.taxasSucesso.clientes}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Componente de loading skeleton
function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-9 w-48 bg-zinc-800/50 rounded-lg animate-pulse"></div>
          <div className="h-4 w-64 bg-zinc-800/30 rounded animate-pulse"></div>
        </div>
        <div className="flex gap-3">
          <div className="h-9 w-24 bg-zinc-800/50 rounded-lg animate-pulse"></div>
          <div className="h-9 w-32 bg-zinc-800/50 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Primeira linha: Cards de métricas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={`metric-${i}`} className="border-zinc-800 bg-zinc-950/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-2 flex-1">
                <div className="h-5 w-32 bg-zinc-800/50 rounded animate-pulse"></div>
              </div>
              <div className="h-5 w-5 bg-zinc-800/50 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-zinc-800/60 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-20 bg-zinc-800/40 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Segunda linha: Cards de sincronização e taxas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card de sincronização skeleton */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-36 bg-zinc-800/50 rounded animate-pulse"></div>
            </div>
            <div className="h-5 w-5 bg-zinc-800/50 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-7 w-40 bg-zinc-800/60 rounded animate-pulse mb-3"></div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-zinc-800/40 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-zinc-800/50 rounded animate-pulse"></div>
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-16 bg-zinc-800/40 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-zinc-800/50 rounded animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de taxas de sucesso skeleton */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <div className="h-5 w-32 bg-zinc-800/50 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-40 bg-zinc-800/40 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={`progress-${j}`}>
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-zinc-800/50 rounded animate-pulse"></div>
                      <div className="h-4 w-16 bg-zinc-800/40 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-12 bg-zinc-800/50 rounded animate-pulse"></div>
                  </div>
                  <div className="h-3 w-full bg-zinc-800/30 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terceira linha: Atividades e Status */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
        {/* Card de atividades skeleton */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader>
            <div className="h-5 w-32 bg-zinc-800/50 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-zinc-800/40 rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, k) => (
                <div key={`activity-${k}`} className="flex items-center gap-4 rounded-lg border border-zinc-800 p-3">
                  <div className="h-8 w-8 bg-zinc-800/50 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-zinc-800/50 rounded animate-pulse"></div>
                    <div className="h-3 w-24 bg-zinc-800/30 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Card de status skeleton */}
        <Card className="border-zinc-800 bg-zinc-950/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <div className="h-5 w-32 bg-zinc-800/50 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-40 bg-zinc-800/40 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-zinc-800/50 rounded-full animate-pulse"></div>
              <div className="h-3 w-12 bg-zinc-800/40 rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: 3 }).map((_, l) => (
                  <div key={`status-${l}`} className="flex items-center justify-between p-2 rounded-lg bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-zinc-800/50 rounded animate-pulse"></div>
                      <div className="h-4 w-32 bg-zinc-800/40 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-zinc-800/50 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 w-28 bg-zinc-800/40 rounded animate-pulse"></div>
                  <div className="h-4 w-12 bg-zinc-800/50 rounded animate-pulse"></div>
                </div>
                <div className="h-3 w-full bg-zinc-800/30 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function Dashboard() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  )
}
