import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header skeleton */}
      <div className="border-b border-border bg-card/50 h-14 flex items-center px-8">
        <Skeleton className="h-5 w-40" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Period selector */}
        <Skeleton className="h-9 w-64" />

        {/* Pipeline scorecards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3.5 w-24 mt-2" />
            </Card>
          ))}
        </div>

        {/* Overall conversion */}
        <Card className="p-5">
          <Skeleton className="h-10 w-full" />
        </Card>

        {/* Revenue metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-20" />
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card className="p-6">
          <Skeleton className="h-5 w-36 mb-4" />
          <Skeleton className="h-[350px] w-full" />
        </Card>
      </main>
    </div>
  );
}
