import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { OrdersService } from "@/lib/orders-service";
import { useToast } from "@/components/ui/use-toast";
import { useSyncQueue } from "@/hooks/use-sync-queue";
import type { Order, OrderStats } from "@/lib/types-orders";

export const usePedidos = () => {
  const { toast } = useToast();
  const { startSync, finishSync, isSyncing: isGlobalSyncing } = useSyncQueue();
  const queryClient = useQueryClient();

  // Buscar pedidos (localStorage)
  const {
    data: orders = [],
    isLoading: isLoadingOrders,
    refetch: refetchOrders,
  } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => Promise.resolve(OrdersService.getOrders()),
  });

  // Buscar estatísticas
  const {
    data: orderStats = {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      error: 0,
      totalRevenue: 0,
      todayOrders: 0,
      todayRevenue: 0,
    },
    isLoading: isLoadingStats,
    refetch: refetchStats,
  } = useQuery<OrderStats>({
    queryKey: ["orderStats"],
    queryFn: () => Promise.resolve(OrdersService.getOrderStats()),
  });

  // Sincronizar pedidos da Plus (fila global)
  const syncMutation = useMutation({
    mutationFn: async () => {
      const syncTask = { id: "pedidos", label: "Pedidos Plus" };
      const canSync = startSync(syncTask);
      if (!canSync) {
        toast({
          title: "Sincronização em andamento",
          description:
            "Aguarde a sincronização atual finalizar antes de iniciar outra.",
          variant: "default",
        });
        throw new Error("Sincronização em andamento");
      }
      try {
        const result = await OrdersService.syncOrdersFromPlus();
        if (result.success) {
          toast({
            title: "Sincronização concluída",
            description: result.message,
            variant: "default",
          });
          await queryClient.invalidateQueries({ queryKey: ["orders"] });
          await queryClient.invalidateQueries({ queryKey: ["orderStats"] });
        } else {
          toast({
            title: "Erro na sincronização",
            description: result.message,
            variant: "destructive",
          });
        }
        return result;
      } finally {
        finishSync();
      }
    },
  });

  // Enviar pedidos para Saboritte
  const sendMutation = useMutation({
    mutationFn: async (selectedOrders: string[]) => {
      if (selectedOrders.length === 0) {
        toast({
          title: "Nenhum pedido selecionado",
          description:
            "Selecione pelo menos um pedido para enviar para a Saboritte.",
          variant: "destructive",
        });
        throw new Error("Nenhum pedido selecionado");
      }
      const result = await OrdersService.sendOrdersToSaboritte(selectedOrders);
      if (result.success) {
        const failed = result.results.filter((r) => !r.success);
        const successful = result.results.filter((r) => r.success);
        const clientesExistentes = successful.filter(
          (r) => r.clienteExistente
        ).length;
        if (failed.length > 0) {
          toast({
            title: "Alguns pedidos não foram enviados",
            description: `${result.message}\n${failed
              .map((item, i) => `- ${item.message}`)
              .join("\n")}\nVerifique se todos os produtos estão vinculados.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Pedidos enviados",
            description: `${result.message}${
              clientesExistentes > 0
                ? `\n${clientesExistentes} cliente(s) já existente(s) na Saboritte.`
                : ""
            }`,
            variant: "default",
          });
        }
        await queryClient.invalidateQueries({ queryKey: ["orders"] });
        await queryClient.invalidateQueries({ queryKey: ["orderStats"] });
      } else {
        toast({
          title: "Erro ao enviar pedidos",
          description: result.message,
          variant: "destructive",
        });
      }
      return result;
    },
  });

  // Helpers para refetch manual
  const refetchAll = useCallback(() => {
    refetchOrders();
    refetchStats();
  }, [refetchOrders, refetchStats]);

  return {
    orders,
    orderStats,
    isLoading: isLoadingOrders || isLoadingStats,
    isSyncing: isGlobalSyncing || syncMutation.isPending,
    isSending: sendMutation.isPending,
    refetchAll,
    syncOrdersFromPlus: syncMutation.mutateAsync,
    sendOrdersToSaboritte: sendMutation.mutateAsync,
  };
};
