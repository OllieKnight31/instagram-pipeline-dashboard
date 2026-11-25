"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PeriodType, DateRange } from "@/types/dashboard";

interface PeriodSelectorProps {
  period: PeriodType;
  dateRange: DateRange;
  onPeriodChange: (period: PeriodType) => void;
  onDateRangeChange: (range: DateRange) => void;
}

export function PeriodSelector({
  period,
  dateRange,
  onPeriodChange,
  onDateRangeChange,
}: PeriodSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <Tabs value={period} onValueChange={(v) => onPeriodChange(v as PeriodType)}>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Label htmlFor="start-date" className="text-xs text-muted-foreground whitespace-nowrap">
            From
          </Label>
          <Input
            id="start-date"
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              onDateRangeChange({ ...dateRange, start: e.target.value })
            }
            className="h-8 w-[140px] text-xs"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Label htmlFor="end-date" className="text-xs text-muted-foreground whitespace-nowrap">
            To
          </Label>
          <Input
            id="end-date"
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              onDateRangeChange({ ...dateRange, end: e.target.value })
            }
            className="h-8 w-[140px] text-xs"
          />
        </div>
      </div>
    </div>
  );
}
