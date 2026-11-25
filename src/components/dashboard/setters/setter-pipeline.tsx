"use client";

import { Scorecard } from "../scorecard";
import { ConversionArrow } from "../conversion-arrow";
import { formatNumber } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import { Send, Link, Phone } from "lucide-react";
import type { SetterPeriodData } from "@/types/dashboard";

interface SetterPipelineProps {
  current: SetterPeriodData;
  previous: SetterPeriodData;
}

export function SetterPipeline({ current, previous }: SetterPipelineProps) {
  const stages = [
    {
      label: "Outbounds",
      value: current.outbounds,
      prevValue: previous.outbounds,
      icon: Send,
      tooltip: "Outbound messages initiated",
    },
    {
      label: "Links Sent",
      value: current.linksSent,
      prevValue: previous.linksSent,
      icon: Link,
      tooltip: "Booking/application links sent",
    },
    {
      label: "Booked Calls",
      value: current.bookedCalls,
      prevValue: previous.bookedCalls,
      icon: Phone,
      tooltip: "Calls booked from setter activity",
    },
  ];

  const conversions = [
    { rate: current.outboundToLinkRate, label: "Link Rate" },
    { rate: current.linkToBookRate, label: "Book Rate" },
  ];

  return (
    <div>
      {/* Desktop: horizontal pipeline */}
      <div
        className="hidden lg:grid gap-1.5 items-center"
        style={{ gridTemplateColumns: "1fr auto 1fr auto 1fr" }}
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
