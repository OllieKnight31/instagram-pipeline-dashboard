"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { SetterScorecards } from "./setter-scorecards";
import { SetterPipeline } from "./setter-pipeline";
import { SetterDataTable } from "./setter-data-table";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";
import { aggregateSetterRows, groupSettersForChart } from "@/lib/data-utils";
import type { SetterSectionData, PeriodType } from "@/types/dashboard";

const SetterChart = dynamic(
  () => import("./setter-chart").then((m) => ({ default: m.SetterChart })),
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

interface SettersSectionProps {
  data: SetterSectionData;
  period: PeriodType;
}

export function SettersSection({ data, period }: SettersSectionProps) {
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

    // We don't have the previous period's raw rows per-rep,
    // so we show trend as the full-team previous for context
    const current = aggregateSetterRows(filteredRows);
    const chartData = groupSettersForChart(filteredRows, period);

    return {
      current,
      previous: data.previous,
      rows: filteredRows,
      chartData,
    };
  }, [data, selectedRep, period]);

  return (
    <>
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

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Setter Scorecards
          {selectedRep !== "all" && (
            <span className="ml-2 text-primary normal-case">— {selectedRep}</span>
          )}
        </h2>
        <SetterScorecards current={current} previous={previous} />
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
          Setter Pipeline
        </h2>
        <SetterPipeline current={current} previous={previous} />
      </section>

      <Separator />

      <SetterChart data={chartData} />
      <SetterDataTable rows={rows} />
    </>
  );
}
