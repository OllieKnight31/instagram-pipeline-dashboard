"use client";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrendInfo } from "@/types/dashboard";

interface ScorecardProps {
  label: string;
  value: string;
  trend?: TrendInfo;
  icon?: LucideIcon;
  tooltip?: string;
  invertTrend?: boolean; // true for metrics where "down" is good (e.g., CAC)
  className?: string;
}

export function Scorecard({
  label,
  value,
  trend,
  icon: Icon,
  tooltip,
  invertTrend = false,
  className,
}: ScorecardProps) {
  const trendColor = trend
    ? trend.direction === "flat"
      ? "text-muted-foreground"
      : (trend.direction === "up") !== invertTrend
        ? "text-emerald-500"
        : "text-red-500"
    : "";

  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  const card = (
    <Card className={cn("p-5 sm:p-6", className)}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide uppercase whitespace-nowrap">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground/60 shrink-0" />}
      </div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
      {trend && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trendColor)}>
          <TrendIcon className="h-3.5 w-3.5" />
          <span>{Math.abs(trend.change)}%</span>
          <span className="text-muted-foreground font-normal">vs prev</span>
        </div>
      )}
    </Card>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{card}</TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return card;
}
