"use client";

import { Scorecard } from "../scorecard";
import { formatCurrency, formatNumber } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { PoundSterling, Clock, RotateCcw, CreditCard } from "lucide-react";
import type { PaymentPeriodData } from "@/types/dashboard";

interface PaymentScorecardsProps {
  current: PaymentPeriodData;
  previous: PaymentPeriodData;
}

export function PaymentScorecards({ current, previous }: PaymentScorecardsProps) {
  const cards = [
    {
      label: "Total Collected",
      value: formatCurrency(current.totalCollected),
      trend: calculateTrend(current.totalCollected, previous.totalCollected),
      icon: PoundSterling,
      tooltip: "Total payments successfully collected",
    },
    {
      label: "Outstanding Balance",
      value: formatCurrency(current.totalOutstanding),
      trend: calculateTrend(current.totalOutstanding, previous.totalOutstanding),
      icon: Clock,
      tooltip: "Total outstanding balance across all clients",
      invertTrend: true,
    },
    {
      label: "Total Refunded",
      value: formatCurrency(current.totalRefunded),
      trend: calculateTrend(current.totalRefunded, previous.totalRefunded),
      icon: RotateCcw,
      tooltip: "Total amount refunded this period",
      invertTrend: true,
    },
    {
      label: "Active Payment Plans",
      value: formatNumber(current.activePaymentPlans),
      trend: calculateTrend(current.activePaymentPlans, previous.activePaymentPlans),
      icon: CreditCard,
      tooltip: "Installment plans with outstanding balance",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
