"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ArrowUpDown } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PaymentDataRow } from "@/types/dashboard";

interface PaymentDataTableProps {
  rows: PaymentDataRow[];
}

type SortField = keyof PaymentDataRow;
type SortDir = "asc" | "desc";

const STATUS_COLORS: Record<string, string> = {
  paid: "text-emerald-500",
  pending: "text-amber-500",
  failed: "text-red-500",
  refunded: "text-zinc-500",
};

function getStatusColor(status: string): string {
  return STATUS_COLORS[status.toLowerCase()] || "";
}

const COLUMNS: {
  key: SortField;
  label: string;
  format: (v: number | string, row: PaymentDataRow) => string;
  statusColor?: boolean;
}[] = [
  { key: "date", label: "Date", format: (v) => String(v) },
  { key: "clientName", label: "Client", format: (v) => String(v) },
  { key: "downPayment", label: "Down Payment", format: (v) => formatCurrency(Number(v)) },
  { key: "paymentMethod", label: "Method", format: (v) => String(v) },
  { key: "status", label: "Status", format: (v) => String(v), statusColor: true },
  { key: "programme", label: "Programme", format: (v) => String(v) },
  { key: "paymentType", label: "Type", format: (v) => String(v) },
  { key: "totalContracted", label: "Total Contracted", format: (v) => formatCurrency(Number(v)) },
  { key: "revenue", label: "Revenue", format: (v) => formatCurrency(Number(v)) },
  { key: "dueDate", label: "Due Date", format: (v) => String(v) },
];

export function PaymentDataTable({ rows }: PaymentDataTableProps) {
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const cmp =
      typeof aVal === "string"
        ? aVal.localeCompare(String(bVal))
        : Number(aVal) - Number(bVal);
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Payment Records</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "cursor-pointer select-none whitespace-nowrap hover:text-foreground",
                    sortField === col.key && "text-foreground"
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={COLUMNS.length}
                  className="text-center text-muted-foreground py-8"
                >
                  No data for this period
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row, i) => (
                <TableRow key={`${row.date}-${row.clientName}-${row.stripeId}-${i}`}>
                  {COLUMNS.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "whitespace-nowrap",
                        col.statusColor && getStatusColor(String(row[col.key]))
                      )}
                    >
                      {col.format(row[col.key], row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
