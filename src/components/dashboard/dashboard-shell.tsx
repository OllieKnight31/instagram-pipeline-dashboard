"use client";

import { CreditLink } from "@/components/credit-link";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { ClientHeader } from "./client-header";
import { PeriodSelector } from "./period-selector";
import { PipelineScorecards } from "./pipeline-scorecards";
import { OverallConversion } from "./overall-conversion";
import { RevenueMetrics } from "./revenue-metrics";
import { SettersSection } from "./setters/setters-section";
import { ClosersSection } from "./closers/closers-section";
import { AdsSection } from "./ads/ads-section";
import { PaymentsSection } from "./payments/payments-section";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";
import { getDefaultDateRange } from "@/lib/data-utils";
import { setCurrency, getCurrency } from "@/lib/format";
import type {
  PeriodType, DateRange, DashboardResponse, DashboardSection, ClientInfo,
} from "@/types/dashboard";

const TrendChart = dynamic(
  () => import("./trend-chart").then((m) => ({ default: m.TrendChart })),
  { ssr: false, loading: () => <ChartSkeleton /> }
);

function ChartSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-5 w-36 mb-4" />
      <Skeleton className="h-[350px] w-full" />
    </Card>
  );
}

function ScorecardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="p-5">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3.5 w-24 mt-2" />
        </Card>
      ))}
    </div>
  );
}

interface DashboardShellProps {
  clientId: string;
  clientName: string;
  brandColor: string;
  clients: ClientInfo[];
}

const SECTION_LABELS: Record<DashboardSection, string> = {
  overview: "Overview",
  setters: "Setters",
  closers: "Closers",
  ads: "Ads",
  payments: "Payments",
};

export function DashboardShell({
  clientId,
  clientName,
  brandColor,
  clients,
}: DashboardShellProps) {
  const [period, setPeriod] = useState<PeriodType>("weekly");
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultDateRange("weekly"));
  const [section, setSection] = useState<DashboardSection>("overview");
  const [data, setData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetStatus, setSheetStatus] = useState<"green" | "amber" | "red">("red");
  const [currency, setCurrencyState] = useState(getCurrency());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        start: dateRange.start,
        end: dateRange.end,
        section,
      });
      const res = await fetch(`/api/data/${clientId}?${params}`);
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/";
          return;
        }
        throw new Error("Failed to fetch data");
      }
      const json = await res.json();
      setData(json);
      // Determine sheet health: green if data present, amber if section empty
      if (json && (json.overview || json.setters || json.closers || json.ads || json.payments)) {
        const activeSection = json[section];
        if (activeSection && activeSection.rows && activeSection.rows.length === 0) {
          setSheetStatus("amber");
        } else {
          setSheetStatus("green");
        }
      } else {
        setSheetStatus("amber");
      }
    } catch {
      setSheetStatus("red");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [clientId, period, dateRange, section]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handlePeriodChange(newPeriod: PeriodType) {
    setPeriod(newPeriod);
    setDateRange(getDefaultDateRange(newPeriod));
  }

  function handleSectionChange(value: string) {
    setSection(value as DashboardSection);
  }

  return (
    <div
      className="min-h-screen bg-background"
      style={{ "--client-brand": brandColor } as React.CSSProperties}
    >
      <ClientHeader
        clientName={clientName}
        clientId={clientId}
        clients={clients}
      />

      {/* Google Sheets Connection Status */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-4 text-xs">
          <span className="text-muted-foreground font-medium shrink-0">Data Source</span>
          <div className="flex items-center gap-1.5 shrink-0 px-2 py-1">
            <span className={`h-2 w-2 rounded-full ${sheetStatus === "green" ? "bg-emerald-500 shadow-[0_0_4px_rgba(52,211,153,0.5)]" : sheetStatus === "amber" ? "bg-amber-500 shadow-[0_0_4px_rgba(251,191,36,0.5)]" : "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]"}`} />
            <span className="text-muted-foreground">Google Sheets</span>
            <span className={`ml-1 ${sheetStatus === "green" ? "text-emerald-500" : sheetStatus === "amber" ? "text-amber-500" : "text-red-500"}`}>
              {sheetStatus === "green" ? "Connected" : sheetStatus === "amber" ? "Partial data" : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex items-center gap-3">
          <PeriodSelector
            period={period}
            dateRange={dateRange}
            onPeriodChange={handlePeriodChange}
            onDateRangeChange={setDateRange}
          />
          <div className="flex items-center gap-2 ml-auto">
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                setCurrencyState(e.target.value);
                fetchData();
              }}
              className="h-8 px-2 text-xs rounded-md border border-border bg-background text-foreground cursor-pointer outline-none"
            >
              <option value="GBP">£ GBP</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>

        <Tabs value={section} onValueChange={handleSectionChange}>
          <TabsList className="w-full justify-start">
            {Object.entries(SECTION_LABELS).map(([key, label]) => (
              <TabsTrigger key={key} value={key} className="text-xs sm:text-sm">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {loading || !data ? (
          <>
            <ScorecardsSkeleton />
            <Card className="p-5">
              <Skeleton className="h-10 w-full" />
            </Card>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-8 w-20" />
                </Card>
              ))}
            </div>
            <ChartSkeleton />
          </>
        ) : (
          <>
            {section === "overview" && data.overview && (
              <>
                <section>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Pipeline
                  </h2>
                  <PipelineScorecards
                    current={data.overview.current}
                    previous={data.overview.previous}
                  />
                </section>

                <OverallConversion
                  current={data.overview.current}
                  previous={data.overview.previous}
                />

                <Separator />

                <section>
                  <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                    Revenue & Costs
                  </h2>
                  <RevenueMetrics
                    current={data.overview.current}
                    previous={data.overview.previous}
                  />
                </section>

                <Separator />

                <TrendChart data={data.overview.chartData} />
              </>
            )}

            {section === "setters" && data.setters && (
              <SettersSection data={data.setters} period={period} />
            )}

            {section === "closers" && data.closers && (
              <ClosersSection data={data.closers} period={period} />
            )}

            {section === "ads" && data.ads && (
              <AdsSection data={data.ads} />
            )}

            {section === "payments" && data.payments && (
              <PaymentsSection data={data.payments} />
            )}
          </>
        )}
      </main>

      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">
        <CreditLink />
      </footer>
    </div>
  );
}
