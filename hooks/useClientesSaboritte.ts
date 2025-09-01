import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Função para buscar clientes Saboritte
async function fetchClientesSaboritte(email: string, senha: string) {
  const apiUrl =
    "https://bot-mauric-backend.rkwxxj.easypanel.host/api/buscar-clientes-sab";
  const params = new URLSearchParams({ email, senha });
  const response = await fetch(`${apiUrl}?${params.toString()}`, {
    headers: {
      "x-Secret": "019639df-80f6-7d17-8de1-0a1d3436f2ce",
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`Erro: ${response.status}`);
  return response.json();
}

export function useClientesSaboritte(
  email: string,
  senha: string,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["clientes-saboritte", email],
    queryFn: () => fetchClientesSaboritte(email, senha),
    enabled: !!email && !!senha && enabled,
  });
}
