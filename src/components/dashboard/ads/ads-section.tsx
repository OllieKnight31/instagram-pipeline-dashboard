"use client";

import dynamic from "next/dynamic";
import { AdScorecards } from "./ad-scorecards";
import { AdDetailMetrics } from "./ad-detail-metrics";
import { AdDataTable } from "./ad-data-table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { AdSectionData } from "@/types/dashboard";

const AdChart = dynamic(
  () => import("./ad-chart").then((m) => ({ default: m.AdChart })),
  {
    ssr: false,
    loading: () => (
      <Card className="p-6">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-[350px] w-full" />
      </Card>
    ),
  }
);

interface AdsSectionProps {
  data: AdSectionData;
}

export function AdsSection({ data }: AdsSectionProps) {
  return (
    <>
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Ad Scorecards
        </h2>
        <AdScorecards current={data.current} previous={data.previous} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Detail Metrics
        </h2>
        <AdDetailMetrics current={data.current} previous={data.previous} />
      </section>

      <Separator />

      <AdChart data={data.chartData} />
      <AdDataTable rows={data.rows} />
    </>
  );
}
