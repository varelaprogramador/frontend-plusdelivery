import type React from "react"
import { useLazyImage } from "@/hooks/use-lazy-image"

interface LazyImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width = 40,
  height = 40,
  className = "",
  placeholder = "/placeholder.svg",
}) => {
  const { imageSrc, isLoaded, isError, imgRef } = useLazyImage(src, placeholder)

  if (isError) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-800 text-xs text-zinc-400 rounded-md ${className}`}
        style={{ width, height }}
      >
        N/A
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden rounded-md ${className}`} style={{ width, height }}>
      <img
        ref={imgRef}
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        className={`object-cover transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-50"}`}
        width={width}
        height={height}
        loading="lazy"
      />
      {!isLoaded && <div className="absolute inset-0 bg-zinc-800 animate-pulse" />}
    </div>
  )
}
