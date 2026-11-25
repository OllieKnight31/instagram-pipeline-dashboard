"use client";

import { Scorecard } from "./scorecard";
import { ConversionArrow } from "./conversion-arrow";
import { formatNumber } from "@/lib/format";
import { calculateTrend } from "@/lib/data-utils";
import {
  Eye, Users, UserCheck, MessageSquare, Link,
  CalendarCheck, Phone, Handshake, Trophy,
} from "lucide-react";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";
import type { OverviewPeriodData } from "@/types/dashboard";

interface PipelineScorecardProps {
  current: OverviewPeriodData;
  previous: OverviewPeriodData;
}

export function PipelineScorecards({ current, previous }: PipelineScorecardProps) {
  const topFunnel = [
    {
      label: "Visits",
      value: current.profileVisits,
      prevValue: previous.profileVisits,
      icon: Eye,
      tooltip: "Total Instagram profile visits",
    },
    {
      label: "Followers",
      value: current.followers,
      prevValue: previous.followers,
      icon: Users,
      tooltip: "New followers gained",
    },
    {
      label: "Qualified",
      value: current.qualifiedFollowers,
      prevValue: previous.qualifiedFollowers,
      icon: UserCheck,
      tooltip: "Qualified followers identified",
    },
    {
      label: "Messages",
      value: current.messagesSent,
      prevValue: previous.messagesSent,
      icon: MessageSquare,
      tooltip: "DMs sent to qualified followers",
    },
    {
      label: "Links Sent",
      value: current.linksSent,
      prevValue: previous.linksSent,
      icon: Link,
      tooltip: "Booking links sent to prospects",
    },
  ];

  const bottomFunnel = [
    {
      label: "Booked",
      value: current.bookedCalls,
      prevValue: previous.bookedCalls,
      icon: CalendarCheck,
      tooltip: "Discovery/sales calls booked",
    },
    {
      label: "Shows",
      value: current.shows,
      prevValue: previous.shows,
      icon: Phone,
      tooltip: "Calls that actually happened",
    },
    {
      label: "Offers",
      value: current.offersMade,
      prevValue: previous.offersMade,
      icon: Handshake,
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

  const topConversions = [
    { rate: current.followerRate, label: "Follower Rate" },
    { rate: current.qualifiedRate, label: "Qualified Rate" },
    { rate: current.messageRate, label: "Message Rate" },
    { rate: current.linkRate, label: "Link Rate" },
  ];

  const bottomConversions = [
    { rate: current.showRate, label: "Show Rate" },
    { rate: current.offerRate, label: "Offer Rate" },
    { rate: current.closeRate, label: "Close Rate" },
  ];

  const allStages = [...topFunnel, ...bottomFunnel];
  const allConversions = [
    ...topConversions,
    { rate: current.bookingRate, label: "Booking Rate" },
    ...bottomConversions,
  ];

  return (
    <div>
      {/* Desktop: two-row horizontal pipeline */}
      <div className="hidden lg:block space-y-3">
        {/* Row 1: Top of Funnel (Profile → Links Sent) */}
        <div
          className="grid gap-1.5 items-stretch"
          style={{ gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr auto 1fr" }}
        >
          {topFunnel.map((stage, i) => (
            <div key={stage.label} className="contents">
              <Scorecard
                label={stage.label}
                value={formatNumber(stage.value)}
                trend={calculateTrend(stage.value, stage.prevValue)}
                icon={stage.icon}
                tooltip={stage.tooltip}
                className="min-h-[140px]"
              />
              {i < topFunnel.length - 1 && (
                <ConversionArrow
                  rate={topConversions[i].rate}
                  label={topConversions[i].label}
                  className="px-1"
                />
              )}
            </div>
          ))}
        </div>

        {/* Connector: Links Sent → Booked Calls */}
        <div className="flex justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <ArrowDown className={cn("h-5 w-5", getConnectorColor(current.bookingRate))} />
            <span className={cn("text-xs font-semibold", getConnectorColor(current.bookingRate))}>
              {formatPercent(current.bookingRate)}
            </span>
            <span className="text-[10px] text-muted-foreground">Booking Rate</span>
          </div>
        </div>

        {/* Row 2: Sales Funnel (Booked Calls → Closed) */}
        <div
          className="grid gap-1.5 items-stretch max-w-3xl mx-auto"
          style={{ gridTemplateColumns: "1fr auto 1fr auto 1fr auto 1fr" }}
        >
          {bottomFunnel.map((stage, i) => (
            <div key={stage.label} className="contents">
              <Scorecard
                label={stage.label}
                value={formatNumber(stage.value)}
                trend={calculateTrend(stage.value, stage.prevValue)}
                icon={stage.icon}
                tooltip={stage.tooltip}
                className="min-h-[140px]"
              />
              {i < bottomFunnel.length - 1 && (
                <ConversionArrow
                  rate={bottomConversions[i].rate}
                  label={bottomConversions[i].label}
                  className="px-1"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile/Tablet: vertical pipeline */}
      <div className="lg:hidden space-y-1">
        {allStages.map((stage, i) => (
          <div key={stage.label}>
            <Scorecard
              label={stage.label}
              value={formatNumber(stage.value)}
              trend={calculateTrend(stage.value, stage.prevValue)}
              icon={stage.icon}
              tooltip={stage.tooltip}
            />
            {i < allStages.length - 1 && (
              <div className="flex justify-center">
                <ConversionArrow
                  rate={allConversions[i].rate}
                  label={allConversions[i].label}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function getConnectorColor(rate: number): string {
  if (rate >= 10) return "text-emerald-500";
  if (rate >= 5) return "text-amber-500";
  return "text-red-500";
}
