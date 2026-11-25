"use client";

import { Scorecard } from "../scorecard";
import { formatNumber, formatCurrency } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { Calendar, Users, Presentation, Trophy, PoundSterling, Banknote } from "lucide-react";
import type { CloserPeriodData } from "@/types/dashboard";

interface CloserScorecardsProps {
  current: CloserPeriodData;
  previous: CloserPeriodData;
}

export function CloserScorecards({ current, previous }: CloserScorecardsProps) {
  const cards = [
    {
      label: "Calls Scheduled",
      value: formatNumber(current.callsScheduled),
      trend: calculateTrend(current.callsScheduled, previous.callsScheduled),
      icon: Calendar,
      tooltip: "Total sales calls scheduled",
    },
    {
      label: "Shows",
      value: formatNumber(current.shows),
      trend: calculateTrend(current.shows, previous.shows),
      icon: Users,
      tooltip: "Calls that actually happened",
    },
    {
      label: "Offers Made",
      value: formatNumber(current.offersMade),
      trend: calculateTrend(current.offersMade, previous.offersMade),
      icon: Presentation,
      tooltip: "Number of offers presented on calls",
    },
    {
      label: "Closed",
      value: formatNumber(current.closed),
      trend: calculateTrend(current.closed, previous.closed),
      icon: Trophy,
      tooltip: "Deals closed / signed",
    },
    {
      label: "Revenue",
      value: formatCurrency(current.revenue),
      trend: calculateTrend(current.revenue, previous.revenue),
      icon: PoundSterling,
      tooltip: "Total revenue from closed deals",
    },
    {
      label: "Cash Collected",
      value: formatCurrency(current.cashCollected),
      trend: calculateTrend(current.cashCollected, previous.cashCollected),
      icon: Banknote,
      tooltip: "Actual cash collected from sales",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Scorecard
          key={card.label}
          label={card.label}
          value={card.value}
          trend={card.trend}
          icon={card.icon}
          tooltip={card.tooltip}
        />
      ))}
    </div>
  );
}
