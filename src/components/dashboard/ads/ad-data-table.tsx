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
import { formatNumber, formatCurrency, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdDataRow } from "@/types/dashboard";

interface AdDataTableProps {
  rows: AdDataRow[];
}

type SortField = keyof AdDataRow;
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortField; label: string; format: (v: number | string) => string }[] = [
  { key: "date", label: "Date", format: (v) => String(v) },
  { key: "platform", label: "Platform", format: (v) => String(v) },
  { key: "campaign", label: "Campaign", format: (v) => String(v) },
  { key: "spend", label: "Spend", format: (v) => formatCurrency(Number(v)) },
  { key: "impressions", label: "Impressions", format: (v) => formatNumber(Number(v)) },
  { key: "clicks", label: "Clicks", format: (v) => formatNumber(Number(v)) },
  { key: "ctr", label: "CTR", format: (v) => formatPercent(Number(v)) },
  { key: "cpc", label: "CPC", format: (v) => formatCurrency(Number(v)) },
  { key: "leads", label: "Leads", format: (v) => formatNumber(Number(v)) },
  { key: "cpl", label: "CPL", format: (v) => formatCurrency(Number(v)) },
  { key: "bookedCalls", label: "Booked", format: (v) => formatNumber(Number(v)) },
  { key: "roas", label: "ROAS", format: (v) => `${Number(v).toFixed(1)}x` },
];

export function AdDataTable({ rows }: AdDataTableProps) {
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
      <h3 className="text-lg font-semibold mb-4">Ad Performance</h3>
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
              sorted.map((row, i) => (
                <TableRow key={`${row.date}-${row.platform}-${row.campaign}-${i}`}>
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
