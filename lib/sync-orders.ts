import { OrdersService } from "./orders-service"
import { toast } from "@/components/ui/use-toast"

export const syncOrdersFromPlus = async () => {
  try {
    const result = await OrdersService.syncOrdersFromPlus()
    toast({
      title: result.success ? "Pedidos sincronizados" : "Erro ao sincronizar pedidos",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    })
    return result.success
  } catch (error) {
    console.error("Erro ao sincronizar pedidos:", error)
    toast({
      title: "Erro ao sincronizar pedidos",
      description: "Ocorreu um erro ao sincronizar os pedidos. Verifique a conexão com a Plus Delivery.",
      variant: "destructive",
    })
    return false
  }
}
