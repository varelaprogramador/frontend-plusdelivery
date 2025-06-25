"use client"

import { useState } from "react"
import { RefreshCw, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { syncCardapioPlus, syncSaboritteProducts, syncOrdersFromPlus } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

// Tipos para os estados de sincronização
type SyncStep = {
  id: string
  name: string
  status: "pending" | "loading" | "success" | "error"
  message: string
}

export function SyncModal() {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [steps, setSteps] = useState<SyncStep[]>([
    {
      id: "plus",
      name: "Cardápio Plus",
      status: "pending",
      message: "Aguardando início da sincronização",
    },
    {
      id: "saboritte",
      name: "Cardápio Saboritte",
      status: "pending",
      message: "Aguardando início da sincronização",
    },
    {
      id: "orders",
      name: "Pedidos",
      status: "pending",
      message: "Aguardando início da sincronização",
    },
  ])

  // Função para atualizar o status de um passo
  const updateStepStatus = (id: string, status: SyncStep["status"], message: string) => {
    setSteps((prevSteps) => prevSteps.map((step) => (step.id === id ? { ...step, status, message } : step)))
  }

  // Função para iniciar a sincronização
  const startSync = async () => {
    setIsRunning(true)

    try {
      // Sincronizar Cardápio Plus
      updateStepStatus("plus", "loading", "Sincronizando cardápio Plus...")
      const plusResult = await syncCardapioPlus()

      if (plusResult.success) {
        updateStepStatus("plus", "success", plusResult.message)
      } else {
        updateStepStatus("plus", "error", plusResult.message)
      }

      // Sincronizar Cardápio Saboritte
      updateStepStatus("saboritte", "loading", "Sincronizando cardápio Saboritte...")
      const saboritteResult = await syncSaboritteProducts()

      if (saboritteResult.success) {
        updateStepStatus("saboritte", "success", saboritteResult.message)
      } else {
        updateStepStatus("saboritte", "error", saboritteResult.message)
      }

      // Sincronizar Pedidos
      updateStepStatus("orders", "loading", "Sincronizando pedidos...")
      const ordersResult = await syncOrdersFromPlus()

      if (ordersResult.success) {
        updateStepStatus("orders", "success", ordersResult.message)
      } else {
        updateStepStatus("orders", "error", ordersResult.message)
      }

      // Verificar se todas as sincronizações foram bem-sucedidas
      const allSuccess = steps.every((step) => step.status === "success")

      if (allSuccess) {
        toast({
          title: "Sincronização concluída",
          description: "Todas as sincronizações foram concluídas com sucesso!",
          variant: "default",
        })
      } else {
        toast({
          title: "Sincronização parcial",
          description: "Algumas sincronizações não foram concluídas com sucesso.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro durante a sincronização:", error)
      toast({
        title: "Erro na sincronização",
        description: "Ocorreu um erro durante o processo de sincronização.",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  // Função para reiniciar o processo
  const resetSync = () => {
    setSteps([
      {
        id: "plus",
        name: "Cardápio Plus",
        status: "pending",
        message: "Aguardando início da sincronização",
      },
      {
        id: "saboritte",
        name: "Cardápio Saboritte",
        status: "pending",
        message: "Aguardando início da sincronização",
      },
      {
        id: "orders",
        name: "Pedidos",
        status: "pending",
        message: "Aguardando início da sincronização",
      },
    ])
  }

  // Função para abrir o modal e iniciar a sincronização
  const handleSyncClick = () => {
    setOpen(true)
    resetSync()
    startSync()
  }

  // Renderizar ícone de status
  const renderStatusIcon = (status: SyncStep["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border border-zinc-600" />
    }
  }

  return (
    <>
      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSyncClick}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Sincronizar Agora
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sincronização em Andamento</DialogTitle>
            <DialogDescription>Aguarde enquanto sincronizamos os dados com os sistemas externos.</DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {steps.map((step) => (
              <div key={step.id} className="flex items-start gap-3 rounded-lg border border-zinc-800 p-3">
                <div className="mt-0.5">{renderStatusIcon(step.status)}</div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{step.name}</h4>
                  <p className="text-xs text-zinc-400">{step.message}</p>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-4 flex items-center justify-between">
            <div className="text-sm text-zinc-400">
              {isRunning ? "Sincronização em andamento..." : "Sincronização concluída"}
            </div>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isRunning}>
              {isRunning ? "Aguarde..." : "Fechar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
