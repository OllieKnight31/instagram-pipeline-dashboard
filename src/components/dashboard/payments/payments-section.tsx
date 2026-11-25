"use client";

import { PaymentScorecards } from "./payment-scorecards";
import { PaymentStatusBadges } from "./payment-status-badges";
import { PaymentDataTable } from "./payment-data-table";
import { Separator } from "@/components/ui/separator";
import type { PaymentSectionData } from "@/types/dashboard";

interface PaymentsSectionProps {
  data: PaymentSectionData;
}

export function PaymentsSection({ data }: PaymentsSectionProps) {
  return (
    <div className="space-y-6">
      <PaymentScorecards current={data.current} previous={data.previous} />
      <PaymentStatusBadges current={data.current} />
      <Separator />
      <PaymentDataTable rows={data.rows} />
    </div>
  );
}
