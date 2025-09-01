import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { STORAGE_KEY_PLUS, type CardapioStoragePlus } from "@/lib/types";

// Função para buscar o cardápio Plus
async function fetchCardapioPlus(email: string, senha: string) {
  const apiUrl =
    "http://localhost:3000/api/cardapio";
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

export function useCardapioPlus(
  email: string,
  senha: string,
  enabled: boolean = true
) {
  const query = useQuery({
    queryKey: ["cardapio-plus", email],
    queryFn: () => fetchCardapioPlus(email, senha),
    enabled: !!email && !!senha && enabled,
  });

  useEffect(() => {
    if (query.data && query.data.menus) {
      const dataToSave: CardapioStoragePlus = {
        data: query.data.menus,
        totalProdutos: query.data.total_produtos || 0,
        ultimaSincronizacao: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_PLUS, JSON.stringify(dataToSave));
    }
  }, [query.data]);

  return query;
}
