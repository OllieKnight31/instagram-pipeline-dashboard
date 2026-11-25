"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CloserScorecards } from "./closer-scorecards";
import { CloserPipeline } from "./closer-pipeline";
import { CloserDataTable } from "./closer-data-table";
import { Scorecard } from "../scorecard";
import { formatPercent, formatCurrency } from "@/lib/format";
import { calculateTrend, aggregateCloserRows, groupClosersForChart } from "@/lib/data-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Target, Gem, Banknote, CalendarCheck, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CloserSectionData, PeriodType } from "@/types/dashboard";

const CloserChart = dynamic(
  () => import("./closer-chart").then((m) => ({ default: m.CloserChart })),
  {
    ssr: false,
    loading: () => (
      <Card className="p-6">
        <Skeleton className="h-5 w-36 mb-4" />
        <Skeleton className="h-[350px] w-full" />
      </Card>
    ),
  }
);

interface ClosersSectionProps {
  data: CloserSectionData;
  period: PeriodType;
}

export function ClosersSection({ data, period }: ClosersSectionProps) {
  const [selectedRep, setSelectedRep] = useState<string>("all");

  const repNames = useMemo(() => {
    const names = new Set<string>();
    for (const row of data.rows) {
      if (row.name && row.name.trim()) names.add(row.name.trim());
    }
    return Array.from(names).sort();
  }, [data.rows]);

  const { current, previous, rows, chartData } = useMemo(() => {
    if (selectedRep === "all") return data;

    const filteredRows = data.rows.filter(
      (r) => r.name.trim() === selectedRep
    );

    const current = aggregateCloserRows(filteredRows);
    const chartData = groupClosersForChart(filteredRows, period);

    return {
      current,
      previous: data.previous,
      rows: filteredRows,
      chartData,
    };
  }, [data, selectedRep, period]);

  // Close Rate hero metric
  const closeRateTrend = calculateTrend(current.closeRate, previous.closeRate);
  const TrendIcon =
    closeRateTrend.direction === "up"
      ? TrendingUp
      : closeRateTrend.direction === "down"
        ? TrendingDown
        : Minus;
  const trendColor =
    closeRateTrend.direction === "up"
      ? "text-emerald-500"
      : closeRateTrend.direction === "down"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Rep Filter */}
      {repNames.length > 1 && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground font-medium">Rep:</span>
          <Select value={selectedRep} onValueChange={setSelectedRep}>
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder="All Reps" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reps</SelectItem>
              {repNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedRep !== "all" && (
            <span className="text-xs text-muted-foreground">
              {rows.length} entries
            </span>
          )}
        </div>
      )}

      {/* Scorecards */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Closer Metrics
          {selectedRep !== "all" && (
            <span className="ml-2 text-primary normal-case">— {selectedRep}</span>
          )}
        </h2>
        <CloserScorecards current={current} previous={previous} />
      </section>

      {/* Pipeline Flow */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Closer Pipeline
        </h2>
        <CloserPipeline current={current} previous={previous} />
      </section>

      {/* Close Rate Hero Card */}
      <Card className="p-5 border-primary/20 bg-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Close Rate (Offers to Closed)
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {formatPercent(current.closeRate)}
              </p>
            </div>
          </div>
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{Math.abs(closeRateTrend.change)}%</span>
            <span className="text-muted-foreground">vs prev</span>
          </div>
        </div>
      </Card>

      {/* Revenue Sub-section */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Revenue
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Scorecard
            label="Avg Deal Value"
            value={current.closed > 0 ? formatCurrency(current.avgDealValue) : "N/A"}
            trend={
              current.closed > 0 && previous.closed > 0
                ? calculateTrend(current.avgDealValue, previous.avgDealValue)
                : undefined
            }
            icon={Gem}
            tooltip="Average revenue per closed deal"
          />
          <Scorecard
            label="Cash Collected Ratio"
            value={current.revenue > 0 ? formatPercent(current.cashCollectedRatio) : "N/A"}
            trend={
              current.revenue > 0 && previous.revenue > 0
                ? calculateTrend(current.cashCollectedRatio, previous.cashCollectedRatio)
                : undefined
            }
            icon={Banknote}
            tooltip="Cash collected as percentage of total revenue"
          />
          <Scorecard
            label="Cash Per Booking"
            value={current.callsScheduled > 0 ? formatCurrency(current.cashPerBooking) : "N/A"}
            trend={
              current.callsScheduled > 0 && previous.callsScheduled > 0
                ? calculateTrend(current.cashPerBooking, previous.cashPerBooking)
                : undefined
            }
            icon={CalendarCheck}
            tooltip="Cash collected divided by total calls scheduled"
          />
          <Scorecard
            label="Cash Per Attended"
            value={current.shows > 0 ? formatCurrency(current.cashPerAttended) : "N/A"}
            trend={
              current.shows > 0 && previous.shows > 0
                ? calculateTrend(current.cashPerAttended, previous.cashPerAttended)
                : undefined
            }
            icon={UserCheck}
            tooltip="Cash collected divided by calls that showed up"
          />
        </div>
      </section>

      <Separator />

      {/* Chart */}
      <CloserChart data={chartData} />

      {/* Data Table */}
      <CloserDataTable rows={rows} />
    </div>
  );
}
