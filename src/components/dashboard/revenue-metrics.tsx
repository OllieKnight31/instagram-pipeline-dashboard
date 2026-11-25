"use client";

import { Scorecard } from "./scorecard";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { PoundSterling, TrendingDown, Gem, BarChart, Banknote } from "lucide-react";
import type { OverviewPeriodData } from "@/types/dashboard";

interface RevenueMetricsProps {
  current: OverviewPeriodData;
  previous: OverviewPeriodData;
}

export function RevenueMetrics({ current, previous }: RevenueMetricsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Scorecard
        label="Revenue"
        value={formatCurrency(current.revenue)}
        trend={calculateTrend(current.revenue, previous.revenue)}
        icon={PoundSterling}
        tooltip="Total revenue from closed deals"
      />
      <Scorecard
        label="Cash Collected"
        value={formatCurrency(current.cashCollected)}
        trend={calculateTrend(current.cashCollected, previous.cashCollected)}
        icon={Banknote}
        tooltip="Actual cash collected from closers"
      />
      <Scorecard
        label="Ad Spend"
        value={formatCurrency(current.adSpend)}
        trend={calculateTrend(current.adSpend, previous.adSpend)}
        icon={TrendingDown}
        tooltip="Total advertising spend"
        invertTrend
      />
      <Scorecard
        label="CAC"
        value={current.closed > 0 ? formatCurrency(current.cac) : "N/A"}
        trend={
          current.closed > 0 && previous.closed > 0
            ? calculateTrend(current.cac, previous.cac)
            : undefined
        }
        icon={Gem}
        tooltip="Cost per Acquisition (Ad Spend / Closed)"
        invertTrend
      />
      <Scorecard
        label="ROI"
        value={current.adSpend > 0 ? formatPercent(current.roi) : "N/A"}
        trend={
          current.adSpend > 0 && previous.adSpend > 0
            ? calculateTrend(current.roi, previous.roi)
            : undefined
        }
        icon={BarChart}
        tooltip="Return on Investment ((Revenue - Ad Spend) / Ad Spend)"
      />
    </div>
  );
}
