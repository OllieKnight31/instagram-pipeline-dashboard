"use client";

import { Scorecard } from "../scorecard";
import { formatNumber, formatPercent } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { MessageSquare, Send, Link, Phone, UserCheck, Target } from "lucide-react";
import type { SetterPeriodData } from "@/types/dashboard";

interface SetterScorecardsProps {
  current: SetterPeriodData;
  previous: SetterPeriodData;
}

export function SetterScorecards({ current, previous }: SetterScorecardsProps) {
  const cards = [
    {
      label: "Messages Sent",
      value: formatNumber(current.messagesSent),
      trend: calculateTrend(current.messagesSent, previous.messagesSent),
      icon: MessageSquare,
      tooltip: "Total messages sent by setters",
    },
    {
      label: "Outbounds",
      value: formatNumber(current.outbounds),
      trend: calculateTrend(current.outbounds, previous.outbounds),
      icon: Send,
      tooltip: "Outbound messages initiated",
    },
    {
      label: "Links Sent",
      value: formatNumber(current.linksSent),
      trend: calculateTrend(current.linksSent, previous.linksSent),
      icon: Link,
      tooltip: "Booking/application links sent",
    },
    {
      label: "Booked Calls",
      value: formatNumber(current.bookedCalls),
      trend: calculateTrend(current.bookedCalls, previous.bookedCalls),
      icon: Phone,
      tooltip: "Calls booked from setter activity",
    },
    {
      label: "Qualified Followers",
      value: formatNumber(current.qualifiedFollowers),
      trend: calculateTrend(current.qualifiedFollowers, previous.qualifiedFollowers),
      icon: UserCheck,
      tooltip: "Followers matching ICP criteria",
    },
    {
      label: "KPI Hit Rate",
      value: formatPercent(current.kpiHitRate),
      trend: calculateTrend(current.kpiHitRate, previous.kpiHitRate),
      icon: Target,
      tooltip: "Percentage of days KPIs were hit",
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
