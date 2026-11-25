"use client";

import { Scorecard } from "../scorecard";
import { ConversionArrow } from "../conversion-arrow";
import { formatNumber } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { Calendar, Users, Presentation, Trophy } from "lucide-react";
import type { CloserPeriodData } from "@/types/dashboard";

interface CloserPipelineProps {
  current: CloserPeriodData;
  previous: CloserPeriodData;
}

export function CloserPipeline({ current, previous }: CloserPipelineProps) {
  const stages = [
    {
      label: "Scheduled",
      value: current.callsScheduled,
      prevValue: previous.callsScheduled,
      icon: Calendar,
      tooltip: "Total sales calls scheduled",
    },
    {
      label: "Shows",
      value: current.shows,
      prevValue: previous.shows,
      icon: Users,
      tooltip: "Calls that actually happened",
    },
    {
      label: "Offers",
      value: current.offersMade,
      prevValue: previous.offersMade,
      icon: Presentation,
      tooltip: "Offers presented on calls",
    },
    {
      label: "Closed",
      value: current.closed,
      prevValue: previous.closed,
      icon: Trophy,
      tooltip: "Deals closed / signed",
    },
  ];

  const conversions = [
    { rate: current.showRate, label: "Show Rate" },
    { rate: current.offerRate, label: "Offer Rate" },
    { rate: current.closeRate, label: "Close Rate" },
  ];

  return (
    <div>
      {/* Desktop: horizontal pipeline */}
      <div
        className="hidden lg:grid gap-1.5 items-center"
        style={{ gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr" }}
      >
        {stages.map((stage, i) => (
          <div key={stage.label} className="contents">
            <Scorecard
              label={stage.label}
              value={formatNumber(stage.value)}
              trend={calculateTrend(stage.value, stage.prevValue)}
              icon={stage.icon}
              tooltip={stage.tooltip}
            />
            {i < stages.length - 1 && (
              <ConversionArrow
                rate={conversions[i].rate}
                label={conversions[i].label}
                className="px-1"
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile/Tablet: vertical pipeline */}
      <div className="lg:hidden space-y-1">
        {stages.map((stage, i) => (
          <div key={stage.label}>
            <Scorecard
              label={stage.label}
              value={formatNumber(stage.value)}
              trend={calculateTrend(stage.value, stage.prevValue)}
              icon={stage.icon}
              tooltip={stage.tooltip}
            />
            {i < stages.length - 1 && (
              <div className="flex justify-center">
                <ConversionArrow
                  rate={conversions[i].rate}
                  label={conversions[i].label}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
