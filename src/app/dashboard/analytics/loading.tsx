
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col space-y-2 rounded-lg border bg-card p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-7 w-1/2" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
         <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[300px] w-full" />
        </div>
        <div className="flex flex-col space-y-4 rounded-lg border bg-card p-6">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    </div>
  );
}
