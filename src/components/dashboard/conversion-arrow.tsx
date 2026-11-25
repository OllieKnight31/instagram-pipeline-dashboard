"use client";

import { ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/format";

interface ConversionArrowProps {
  rate: number;
  label: string;
  className?: string;
}

function getArrowColor(rate: number): string {
  if (rate >= 10) return "text-emerald-500";
  if (rate >= 5) return "text-amber-500";
  return "text-red-500";
}

export function ConversionArrow({ rate, label, className }: ConversionArrowProps) {
  const color = getArrowColor(rate);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-0.5", className)}>
      {/* Horizontal arrow on desktop */}
      <div className="hidden lg:flex flex-col items-center gap-0.5">
        <span className={cn("text-xs font-semibold", color)}>
          {formatPercent(rate)}
        </span>
        <ArrowRight className={cn("h-4 w-4", color)} />
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      </div>
      {/* Vertical arrow on mobile/tablet */}
      <div className="flex lg:hidden items-center gap-2 py-1">
        <ArrowDown className={cn("h-4 w-4", color)} />
        <span className={cn("text-xs font-semibold", color)}>
          {formatPercent(rate)}
        </span>
        <span className="text-[10px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
