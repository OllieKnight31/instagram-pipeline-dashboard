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
import { formatNumber, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CloserDataRow } from "@/types/dashboard";

interface CloserDataTableProps {
  rows: CloserDataRow[];
}

type SortField = keyof CloserDataRow;
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortField; label: string; format: (v: number | string) => string }[] = [
  { key: "date", label: "Date", format: (v) => String(v) },
  { key: "name", label: "Name", format: (v) => String(v) },
  { key: "callsScheduled", label: "Scheduled", format: (v) => formatNumber(Number(v)) },
  { key: "shows", label: "Shows", format: (v) => formatNumber(Number(v)) },
  { key: "noShows", label: "No Shows", format: (v) => formatNumber(Number(v)) },
  { key: "offersMade", label: "Offers", format: (v) => formatNumber(Number(v)) },
  { key: "closed", label: "Closed", format: (v) => formatNumber(Number(v)) },
  { key: "revenue", label: "Revenue", format: (v) => formatCurrency(Number(v)) },
  { key: "cashCollected", label: "Cash Collected", format: (v) => formatCurrency(Number(v)) },
  { key: "followUpCalls", label: "Follow Ups", format: (v) => formatNumber(Number(v)) },
  { key: "rescheduled", label: "Rescheduled", format: (v) => formatNumber(Number(v)) },
  { key: "avgDealValue", label: "Deal Value", format: (v) => formatCurrency(Number(v)) },
];

export function CloserDataTable({ rows }: CloserDataTableProps) {
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
    const cmp = typeof aVal === "string" ? aVal.localeCompare(String(bVal)) : Number(aVal) - Number(bVal);
    return sortDir === "asc" ? cmp : -cmp;
  });

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-lg font-semibold mb-4">Closer Activity</h3>
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
                <TableCell colSpan={COLUMNS.length} className="text-center text-muted-foreground py-8">
                  No data for this period
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((row, idx) => (
                <TableRow key={`${row.date}-${row.name}-${idx}`}>
                  {COLUMNS.map((col) => (
                    <TableCell key={col.key} className="whitespace-nowrap">
                      {col.format(row[col.key])}
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
