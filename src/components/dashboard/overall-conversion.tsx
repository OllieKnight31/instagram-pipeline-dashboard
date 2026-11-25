"use client";

import { Card } from "@/components/ui/card";
import { formatPercent } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OverviewPeriodData } from "@/types/dashboard";

interface OverallConversionProps {
  current: OverviewPeriodData;
  previous: OverviewPeriodData;
}

export function OverallConversion({ current, previous }: OverallConversionProps) {
  const trend = calculateTrend(current.overallConversion, previous.overallConversion);
  const TrendIcon =
    trend.direction === "up" ? TrendingUp : trend.direction === "down" ? TrendingDown : Minus;
  const trendColor =
    trend.direction === "up"
      ? "text-emerald-500"
      : trend.direction === "down"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <Card className="p-6 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Overall Conversion (Profile Visits to Closed)
            </p>
            <p className="text-4xl font-bold tracking-tight">
              {formatPercent(current.overallConversion)}
            </p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
          <TrendIcon className="h-4 w-4" />
          <span>{Math.abs(trend.change)}%</span>
          <span className="text-muted-foreground">vs prev</span>
        </div>
      </div>
    </Card>
  );
}
