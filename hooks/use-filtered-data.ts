"use client"

import { useMemo } from "react"
import { useDebounce } from "./use-debounce"

interface UseFilteredDataProps<T> {
  data: T[]
  searchTerm: string
  searchFields: (keyof T)[]
  filters?: Record<string, any>
  debounceDelay?: number
}

export function useFilteredData<T>({
  data,
  searchTerm,
  searchFields,
  filters = {},
  debounceDelay = 300,
}: UseFilteredDataProps<T>) {
  const debouncedSearchTerm = useDebounce(searchTerm, debounceDelay)

  const filteredData = useMemo(() => {
    if (!Array.isArray(data)) {
      return []
    }

    let filtered = [...data]

    // Aplicar filtro de busca
    if (debouncedSearchTerm) {
      const term = debouncedSearchTerm.toLowerCase()
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return value && String(value).toLowerCase().includes(term)
        }),
      )
    }

    // Aplicar outros filtros
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "" && value !== "all") {
        filtered = filtered.filter((item) => {
          const itemValue = (item as any)[key]
          if (typeof value === "boolean") {
            return itemValue === value
          }
          if (typeof value === "string") {
            return String(itemValue).toLowerCase().includes(value.toLowerCase())
          }
          return itemValue === value
        })
      }
    })

    return filtered
  }, [data, debouncedSearchTerm, searchFields, filters])

  return filteredData
}
