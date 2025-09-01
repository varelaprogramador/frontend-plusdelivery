import { Skeleton } from "@/components/ui/skeleton"

export default function DocLoading() {
  return (
    <div className="container mx-auto py-6">
      <Skeleton className="h-10 w-1/3 mb-2" />
      <Skeleton className="h-5 w-2/3 mb-8" />

      <Skeleton className="h-10 w-full mb-4" />

      <div className="space-y-4">
        <Skeleton className="h-[300px] w-full rounded-lg" />
      </div>
    </div>
  )
}
