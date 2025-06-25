import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Função para buscar notificações
async function fetchNotifications() {
  const response = await fetch("/api/notifications");
  if (!response.ok) throw new Error("Erro ao buscar notificações");
  return response.json();
}

// Função para marcar notificações como lidas
async function markNotificationsRead(ids: string[]) {
  const response = await fetch("/api/notifications/mark-read", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error("Erro ao marcar notificações como lidas");
  return response.json();
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });
  const mutation = useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });
  return { ...query, markRead: mutation.mutate };
}
