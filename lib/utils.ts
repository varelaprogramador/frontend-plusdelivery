export const cn = (...inputs: (string | undefined | null | boolean)[]): string => {
  return inputs.filter(Boolean).join(" ")
}

// Função para normalizar números de telefone
// Remove todos os caracteres não numéricos (espaços, parênteses, traços, etc.)
export function normalizePhoneNumber(phone: string | null | undefined): string {
  if (!phone) return ""

  // Remove todos os caracteres não numéricos
  return phone.replace(/\D/g, "")
}
