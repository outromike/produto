import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Loading() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 md:px-6">
       <div className="mb-4">
        <Skeleton className="h-10 w-44" />
      </div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
            <div className="space-y-4 rounded-lg border p-6">
                <div className="flex justify-between items-start gap-4">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-8 w-20" />
                </div>
                <Skeleton className="h-5 w-1/3" />
                
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
        <div className="lg:col-span-2">
             <div className="space-y-4 rounded-lg border p-6">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-10 w-full" />
             </div>
        </div>
      </div>
    </div>
  );
}
