import {
  startOfWeek, startOfMonth,
  subDays, subWeeks, subMonths,
  format, parseISO, isWithinInterval, differenceInDays,
} from "date-fns";
import type {
  PeriodType, DateRange, TrendInfo,
  OverviewPeriodData, OverviewChartDataPoint,
  SetterDataRow, SetterPeriodData, SetterChartDataPoint,
  CloserDataRow, CloserPeriodData, CloserChartDataPoint,
  AdDataRow, AdPeriodData, AdChartDataPoint,
  PaymentDataRow, PaymentPeriodData,
} from "@/types/dashboard";

function safeDiv(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function safePct(numerator: number, denominator: number): number {
  return safeDiv(numerator, denominator) * 100;
}

export function filterByDateRange<T extends { date: string }>(
  rows: T[],
  range: DateRange
): T[] {
  const start = parseISO(range.start);
  const end = parseISO(range.end);
  return rows.filter((row) => {
    const d = parseISO(row.date);
    return isWithinInterval(d, { start, end });
  });
}

// --- Overview Aggregation (from Setters + Closers + Ads) ---
export function aggregateOverview(
  setterRows: SetterDataRow[],
  closerRows: CloserDataRow[],
  adRows: AdDataRow[],
): OverviewPeriodData {
  // IG profile funnel (from Setters)
  const profileVisits = setterRows.reduce((s, r) => s + r.profileVisits, 0);
  const followers = setterRows.reduce((s, r) => s + r.followers, 0);
  const qualifiedFollowers = setterRows.reduce((s, r) => s + r.qualifiedFollowers, 0);
  const messagesSent = setterRows.reduce((s, r) => s + r.messagesSent, 0);
  const linksSent = setterRows.reduce((s, r) => s + r.linksSent, 0);
  const bookedCalls = setterRows.reduce((s, r) => s + r.bookedCalls, 0);

  // Sales funnel (from Closers)
  const shows = closerRows.reduce((s, r) => s + r.shows, 0);
  const offersMade = closerRows.reduce((s, r) => s + r.offersMade, 0);
  const closed = closerRows.reduce((s, r) => s + r.closed, 0);
  const revenue = closerRows.reduce((s, r) => s + r.revenue, 0);
  const cashCollected = closerRows.reduce((s, r) => s + r.cashCollected, 0);

  // Ads
  const adSpend = adRows.reduce((s, r) => s + r.spend, 0);
  const leads = adRows.reduce((s, r) => s + r.leads, 0);

  return {
    profileVisits, followers, qualifiedFollowers, messagesSent,
    linksSent, bookedCalls,
    shows, offersMade, closed, revenue, cashCollected,
    adSpend, leads,
    followerRate: safePct(followers, profileVisits),
    qualifiedRate: safePct(qualifiedFollowers, followers),
    messageRate: safePct(messagesSent, qualifiedFollowers),
    linkRate: safePct(linksSent, messagesSent),
    bookingRate: safePct(bookedCalls, linksSent),
    showRate: safePct(shows, bookedCalls),
    offerRate: safePct(offersMade, shows),
    closeRate: safePct(closed, offersMade),
    overallConversion: safePct(closed, profileVisits),
    cac: safeDiv(adSpend, closed),
    roi: safePct(revenue - adSpend, adSpend),
  };
}

export function groupOverviewForChart(
  setterRows: SetterDataRow[],
  closerRows: CloserDataRow[],
  periodType: PeriodType,
): OverviewChartDataPoint[] {
  const setterGroups = groupRows(setterRows, periodType);
  const closerGroups = groupRows(closerRows, periodType);

  const allKeys = new Set([...setterGroups.keys(), ...closerGroups.keys()]);
  return Array.from(allKeys)
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const sg = setterGroups.get(key) || [];
      const cg = closerGroups.get(key) || [];
      return {
        date: key,
        label: periodLabel(key, periodType),
        profileVisits: sg.reduce((s, r) => s + r.profileVisits, 0),
        followers: sg.reduce((s, r) => s + r.followers, 0),
        qualifiedFollowers: sg.reduce((s, r) => s + r.qualifiedFollowers, 0),
        messagesSent: sg.reduce((s, r) => s + r.messagesSent, 0),
        linksSent: sg.reduce((s, r) => s + r.linksSent, 0),
        bookedCalls: sg.reduce((s, r) => s + r.bookedCalls, 0),
        shows: cg.reduce((s, r) => s + r.shows, 0),
        offersMade: cg.reduce((s, r) => s + r.offersMade, 0),
        closed: cg.reduce((s, r) => s + r.closed, 0),
        revenue: cg.reduce((s, r) => s + r.revenue, 0),
      };
    });
}

export function getPreviousDateRange(range: DateRange): DateRange {
  const start = parseISO(range.start);
  const end = parseISO(range.end);
  const days = differenceInDays(end, start) + 1;
  return {
    start: format(subDays(start, days), "yyyy-MM-dd"),
    end: format(subDays(start, 1), "yyyy-MM-dd"),
  };
}

export function calculateTrend(current: number, previous: number): TrendInfo {
  if (previous === 0 && current === 0) return { change: 0, direction: "flat" };
  if (previous === 0) return { change: 100, direction: "up" };
  const change = ((current - previous) / previous) * 100;
  return {
    change: Math.round(change * 10) / 10,
    direction: change > 0.5 ? "up" : change < -0.5 ? "down" : "flat",
  };
}

export function getDefaultDateRange(periodType: PeriodType): DateRange {
  const today = new Date();
  switch (periodType) {
    case "daily":
      return {
        start: format(subDays(today, 6), "yyyy-MM-dd"),
        end: format(today, "yyyy-MM-dd"),
      };
    case "weekly":
      return {
        start: format(subWeeks(today, 3), "yyyy-MM-dd"),
        end: format(today, "yyyy-MM-dd"),
      };
    case "monthly":
      return {
        start: format(subMonths(today, 2), "yyyy-MM-dd"),
        end: format(today, "yyyy-MM-dd"),
      };
  }
}

// --- Helper to group rows by period ---
function groupRows<T extends { date: string }>(
  rows: T[],
  periodType: PeriodType
): Map<string, T[]> {
  if (periodType === "daily") {
    const map = new Map<string, T[]>();
    for (const row of rows) {
      if (!map.has(row.date)) map.set(row.date, []);
      map.get(row.date)!.push(row);
    }
    return map;
  }
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const d = parseISO(row.date);
    const key =
      periodType === "weekly"
        ? format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd")
        : format(startOfMonth(d), "yyyy-MM");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  return groups;
}

function periodLabel(key: string, periodType: PeriodType): string {
  if (periodType === "daily") return format(parseISO(key), "MMM d");
  if (periodType === "weekly") return `Week of ${format(parseISO(key), "MMM d")}`;
  return format(parseISO(key + "-01"), "MMM yyyy");
}

// --- Setter Aggregation ---
export function aggregateSetterRows(rows: SetterDataRow[]): SetterPeriodData {
  const sum = rows.reduce(
    (a, r) => ({
      messagesSent: a.messagesSent + r.messagesSent,
      outbounds: a.outbounds + r.outbounds,
      inbounds: a.inbounds + r.inbounds,
      followUps: a.followUps + r.followUps,
      linksSent: a.linksSent + r.linksSent,
      bookedCalls: a.bookedCalls + r.bookedCalls,
      callsProposed: a.callsProposed + r.callsProposed,
      followers: a.followers + r.followers,
      qualifiedFollowers: a.qualifiedFollowers + r.qualifiedFollowers,
      kpiYes: a.kpiYes + (r.hitKpis.toLowerCase() === "yes" ? 1 : 0),
    }),
    {
      messagesSent: 0, outbounds: 0, inbounds: 0, followUps: 0,
      linksSent: 0, bookedCalls: 0, callsProposed: 0,
      followers: 0, qualifiedFollowers: 0, kpiYes: 0,
    }
  );

  return {
    ...sum,
    totalActivity: sum.messagesSent + sum.outbounds + sum.followUps,
    outboundToLinkRate: safePct(sum.linksSent, sum.outbounds),
    linkToBookRate: safePct(sum.bookedCalls, sum.linksSent),
    kpiHitRate: safePct(sum.kpiYes, rows.length),
  };
}

export function groupSettersForChart(
  rows: SetterDataRow[],
  periodType: PeriodType
): SetterChartDataPoint[] {
  const groups = groupRows(rows, periodType);
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, gr]) => ({
      date: key,
      label: periodLabel(key, periodType),
      messagesSent: gr.reduce((s, r) => s + r.messagesSent, 0),
      outbounds: gr.reduce((s, r) => s + r.outbounds, 0),
      linksSent: gr.reduce((s, r) => s + r.linksSent, 0),
      bookedCalls: gr.reduce((s, r) => s + r.bookedCalls, 0),
    }));
}

// --- Closer Aggregation ---
export function aggregateCloserRows(rows: CloserDataRow[]): CloserPeriodData {
  const sum = rows.reduce(
    (a, r) => ({
      callsScheduled: a.callsScheduled + r.callsScheduled,
      shows: a.shows + r.shows,
      noShows: a.noShows + r.noShows,
      offersMade: a.offersMade + r.offersMade,
      closed: a.closed + r.closed,
      revenue: a.revenue + r.revenue,
      cashCollected: a.cashCollected + r.cashCollected,
      followUpCalls: a.followUpCalls + r.followUpCalls,
      rescheduled: a.rescheduled + r.rescheduled,
    }),
    {
      callsScheduled: 0, shows: 0, noShows: 0, offersMade: 0,
      closed: 0, revenue: 0, cashCollected: 0, followUpCalls: 0, rescheduled: 0,
    }
  );

  return {
    ...sum,
    showRate: safePct(sum.shows, sum.callsScheduled),
    offerRate: safePct(sum.offersMade, sum.shows),
    closeRate: safePct(sum.closed, sum.offersMade),
    cashCollectedRatio: safePct(sum.cashCollected, sum.revenue),
    noShowRate: safePct(sum.noShows, sum.callsScheduled),
    avgDealValue: safeDiv(sum.revenue, sum.closed),
    cashPerBooking: safeDiv(sum.cashCollected, sum.callsScheduled),
    cashPerAttended: safeDiv(sum.cashCollected, sum.shows),
  };
}

export function groupClosersForChart(
  rows: CloserDataRow[],
  periodType: PeriodType
): CloserChartDataPoint[] {
  const groups = groupRows(rows, periodType);
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, gr]) => ({
      date: key,
      label: periodLabel(key, periodType),
      shows: gr.reduce((s, r) => s + r.shows, 0),
      offersMade: gr.reduce((s, r) => s + r.offersMade, 0),
      closed: gr.reduce((s, r) => s + r.closed, 0),
      revenue: gr.reduce((s, r) => s + r.revenue, 0),
    }));
}

// --- Ad Aggregation ---
export function aggregateAdRows(rows: AdDataRow[]): AdPeriodData {
  const sum = rows.reduce(
    (a, r) => ({
      spend: a.spend + r.spend,
      impressions: a.impressions + r.impressions,
      clicks: a.clicks + r.clicks,
      leads: a.leads + r.leads,
      bookedCalls: a.bookedCalls + r.bookedCalls,
    }),
    {
      spend: 0, impressions: 0, clicks: 0, leads: 0,
      bookedCalls: 0,
    }
  );

  return {
    totalSpend: sum.spend,
    totalImpressions: sum.impressions,
    totalClicks: sum.clicks,
    totalLeads: sum.leads,
    totalBookedCalls: sum.bookedCalls,
    avgCtr: safePct(sum.clicks, sum.impressions),
    avgCpc: safeDiv(sum.spend, sum.clicks),
    avgCpm: safeDiv(sum.spend, sum.impressions) * 1000,
    blendedCpl: safeDiv(sum.spend, sum.leads),
    blendedRoas: safeDiv(sum.leads * 5000, sum.spend),
    leadToCallRate: safePct(sum.bookedCalls, sum.leads),
  };
}

export function groupAdsForChart(
  rows: AdDataRow[],
  periodType: PeriodType
): AdChartDataPoint[] {
  const groups = groupRows(rows, periodType);
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, gr]) => {
      const spend = gr.reduce((s, r) => s + r.spend, 0);
      const leads = gr.reduce((s, r) => s + r.leads, 0);
      return {
        date: key,
        label: periodLabel(key, periodType),
        spend,
        leads,
        cpl: safeDiv(spend, leads),
        bookedCalls: gr.reduce((s, r) => s + r.bookedCalls, 0),
      };
    });
}

// --- Payment Aggregation ---
export function aggregatePaymentRows(rows: PaymentDataRow[]): PaymentPeriodData {
  let totalCollected = 0;
  let totalOutstanding = 0;
  let totalRefunded = 0;
  let totalPending = 0;
  let activePaymentPlans = 0;
  let pifCount = 0;
  let installmentCount = 0;
  const revenueByProgramme: Record<string, number> = {};
  const statusCounts: Record<string, number> = {};

  for (const r of rows) {
    const status = r.status.toLowerCase();
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;

    // revenue field maps to "Cash Collected" from the sheet
    const cashCollected = r.revenue || r.downPayment;

    if (status === "paid") totalCollected += cashCollected;
    if (status === "refunded") totalRefunded += cashCollected;
    if (status === "pending") totalPending += r.downPayment;

    totalOutstanding += Math.max(0, r.totalContracted - cashCollected);

    if (r.paymentType.toLowerCase() === "pif") pifCount++;
    if (r.paymentType.toLowerCase() === "installment") {
      installmentCount++;
      if (r.totalContracted > cashCollected) activePaymentPlans++;
    }

    if (r.programme && status === "paid") {
      revenueByProgramme[r.programme] = (revenueByProgramme[r.programme] || 0) + cashCollected;
    }
  }

  return {
    totalCollected,
    totalOutstanding,
    totalRefunded,
    totalPending,
    activePaymentPlans,
    pifCount,
    installmentCount,
    revenueByProgramme,
    statusCounts,
  };
}

// --- Payment Synthesis (from Closers) ---

export function synthesizePaymentsFromClosers(
  closerRows: CloserDataRow[],
  defaultProgramme = "Programme"
): PaymentDataRow[] {
  return closerRows
    .filter((row) => row.closed > 0 && row.revenue > 0)
    .map((row): PaymentDataRow => ({
      date: row.date,
      clientName: row.name,
      downPayment: row.cashCollected,
      paymentMethod: "",
      status: row.cashCollected > 0 ? "Paid" : "Pending",
      programme: defaultProgramme,
      paymentType: row.cashCollected >= row.revenue ? "PIF" : "Installment",
      totalContracted: row.revenue,
      revenue: row.revenue,
      dueDate: "",
      recurring: row.cashCollected < row.revenue ? "Yes" : "No",
      stripeId: "",
      notes: `Auto from ${row.name} EOD — ${row.closed} deal(s) closed`,
    }));
}

export function mergePaymentRows(
  manualRows: PaymentDataRow[],
  synthesizedRows: PaymentDataRow[]
): PaymentDataRow[] {
  const manualKeys = new Set<string>();
  for (const row of manualRows) {
    manualKeys.add(`${row.date}|${row.revenue}`);
    manualKeys.add(`${row.date}|${row.totalContracted}`);
  }
  const unique = synthesizedRows.filter((row) => {
    return !manualKeys.has(`${row.date}|${row.revenue}`) &&
           !manualKeys.has(`${row.date}|${row.totalContracted}`);
  });
  return [...manualRows, ...unique].sort((a, b) => b.date.localeCompare(a.date));
}
