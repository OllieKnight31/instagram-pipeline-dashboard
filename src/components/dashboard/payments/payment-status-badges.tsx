"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaymentPeriodData } from "@/types/dashboard";

interface PaymentStatusBadgesProps {
  current: PaymentPeriodData;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-500",
  pending: "bg-amber-500/10 text-amber-500",
  failed: "bg-red-500/10 text-red-500",
  refunded: "bg-zinc-500/10 text-zinc-500",
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] || "bg-zinc-500/10 text-zinc-500";
}

export function PaymentStatusBadges({ current }: PaymentStatusBadgesProps) {
  const statusEntries = Object.entries(current.statusCounts);
  const programmeEntries = Object.entries(current.revenueByProgramme).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>

      <div className="space-y-5">
        {/* Status Breakdown */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Status Breakdown</p>
          <div className="flex flex-wrap gap-2">
            {statusEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment data</p>
            ) : (
              statusEntries.map(([status, count]) => (
                <Badge
                  key={status}
                  variant="outline"
                  className={cn(
                    "border-transparent text-xs font-medium px-3 py-1",
                    getStatusColor(status)
                  )}
                >
                  {status} ({count})
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* PIF vs Installment Split */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-2">Payment Type Split</p>
          <div className="flex items-center gap-4 text-sm">
            <span>
              <span className="font-semibold">{current.pifCount}</span>{" "}
              <span className="text-muted-foreground">Paid in Full</span>
            </span>
            <span className="text-muted-foreground">/</span>
            <span>
              <span className="font-semibold">{current.installmentCount}</span>{" "}
              <span className="text-muted-foreground">Installment</span>
            </span>
          </div>
        </div>

        {/* Revenue by Programme */}
        {programmeEntries.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Revenue by Programme</p>
            <div className="space-y-1.5">
              {programmeEntries.map(([programme, amount]) => (
                <div key={programme} className="flex items-center justify-between text-sm">
                  <span className="truncate mr-4">{programme}</span>
                  <span className="font-medium shrink-0">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
