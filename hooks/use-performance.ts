"use client"

import type React from "react"

import { useCallback, useRef } from "react"

export function useThrottle<T extends (...args: any[]) => any>(callback: T, delay: number): T {
  const lastCall = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastCall.current >= delay) {
        lastCall.current = now
        return callback(...args)
      } else {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(
          () => {
            lastCall.current = Date.now()
            callback(...args)
          },
          delay - (now - lastCall.current),
        )
      }
    },
    [callback, delay],
  ) as T
}

export function useMemoizedCallback<T extends (...args: any[]) => any>(callback: T, deps: React.DependencyList): T {
  return useCallback(callback, deps)
}

export function useRafCallback<T extends (...args: any[]) => any>(callback: T): T {
  const rafRef = useRef<number>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        callback(...args)
      })
    },
    [callback],
  ) as T
}
