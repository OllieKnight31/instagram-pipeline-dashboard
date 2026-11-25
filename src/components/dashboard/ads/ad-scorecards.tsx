"use client";

import { Scorecard } from "../scorecard";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { DollarSign, Users, Target, Phone, TrendingUp } from "lucide-react";
import type { AdPeriodData } from "@/types/dashboard";

interface AdScorecardsProps {
  current: AdPeriodData;
  previous: AdPeriodData;
}

export function AdScorecards({ current, previous }: AdScorecardsProps) {
  const cards = [
    {
      label: "Total Spend",
      value: formatCurrency(current.totalSpend),
      trend: calculateTrend(current.totalSpend, previous.totalSpend),
      icon: DollarSign,
      tooltip: "Total ad spend across all platforms",
      invertTrend: true,
    },
    {
      label: "Leads",
      value: formatNumber(current.totalLeads),
      trend: calculateTrend(current.totalLeads, previous.totalLeads),
      icon: Users,
      tooltip: "Total leads generated from ads",
    },
    {
      label: "Blended CPL",
      value: formatCurrency(current.blendedCpl),
      trend: calculateTrend(current.blendedCpl, previous.blendedCpl),
      icon: Target,
      tooltip: "Blended cost per lead across all campaigns",
      invertTrend: true,
    },
    {
      label: "Booked Calls",
      value: formatNumber(current.totalBookedCalls),
      trend: calculateTrend(current.totalBookedCalls, previous.totalBookedCalls),
      icon: Phone,
      tooltip: "Calls booked from ad traffic",
    },
    {
      label: "ROAS",
      value: `${current.blendedRoas.toFixed(1)}x`,
      trend: calculateTrend(current.blendedRoas, previous.blendedRoas),
      icon: TrendingUp,
      tooltip: "Return on ad spend (blended)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
