import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <Skeleton className="h-48 w-full rounded-none" />

      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>

      <CardContent className="flex-1 space-y-3 pb-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        <div className="flex flex-wrap gap-1 pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-14" />
        </div>

        <Skeleton className="h-4 w-32 mt-2" />
      </CardContent>

      <CardFooter className="flex gap-2 pt-3 border-t">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-9" />
        <Skeleton className="h-9 w-9" />
      </CardFooter>
    </Card>
  )
}
