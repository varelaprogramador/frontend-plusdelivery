import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  STORAGE_KEY_SABORITTE,
  type CardapioStorageSaboritte,
  type ProdutoSaboritte,
} from "@/lib/types";

// Função para buscar o cardápio Saboritte
async function fetchCardapioSaboritte(email: string, senha: string) {
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/cardapio-sab`;
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

export function useCardapioSaboritte(
  email: string,
  senha: string,
  enabled: boolean = true
) {
  const query = useQuery({
    queryKey: ["cardapio-saboritte", email],
    queryFn: () => fetchCardapioSaboritte(email, senha),
    enabled: !!email && !!senha && enabled,
  });

  useEffect(() => {
    if (query.data && query.data.categorias) {
      // Achatar os produtos por categoria
      const produtos: ProdutoSaboritte[] = Object.entries(
        query.data.categorias
      ).flatMap(([, lista]) => lista as ProdutoSaboritte[]);
      const dataToSave: CardapioStorageSaboritte = {
        data: produtos,
        ultimaSincronizacao: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_SABORITTE, JSON.stringify(dataToSave));
    }
  }, [query.data]);

  return query;
}
