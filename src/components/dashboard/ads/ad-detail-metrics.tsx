"use client";

import { Scorecard } from "../scorecard";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { Percent, Coins, BarChart } from "lucide-react";
import type { AdPeriodData } from "@/types/dashboard";

interface AdDetailMetricsProps {
  current: AdPeriodData;
  previous: AdPeriodData;
}

export function AdDetailMetrics({ current, previous }: AdDetailMetricsProps) {
  const cards = [
    {
      label: "Avg CTR",
      value: formatPercent(current.avgCtr),
      trend: calculateTrend(current.avgCtr, previous.avgCtr),
      icon: Percent,
      tooltip: "Average click-through rate across campaigns",
    },
    {
      label: "Avg CPC",
      value: formatCurrency(current.avgCpc),
      trend: calculateTrend(current.avgCpc, previous.avgCpc),
      icon: Coins,
      tooltip: "Average cost per click",
      invertTrend: true,
    },
    {
      label: "Avg CPM",
      value: formatCurrency(current.avgCpm),
      trend: calculateTrend(current.avgCpm, previous.avgCpm),
      icon: BarChart,
      tooltip: "Average cost per 1,000 impressions",
      invertTrend: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <Scorecard
          key={card.label}
          label={card.label}
          value={card.value}
          trend={card.trend}
          icon={card.icon}
          tooltip={card.tooltip}
          invertTrend={card.invertTrend}
        />
      ))}
    </div>
  );
}
