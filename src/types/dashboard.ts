// --- Client Config ---
export interface ClientConfig {
  id: string;
  name: string;
  sheetId: string;
  brandColor: string;
  status?: string;
  createdAt?: string;
}

export interface ClientsConfig {
  clients: ClientConfig[];
}

export interface ClientInfo {
  id: string;
  name: string;
}

// --- Admin ---
export interface AdminClient extends ClientConfig {
  status: string;
  createdAt: string;
  lastLogin: string | null;
}

// --- Overview Period Data (aggregated from Setters + Closers + Ads) ---
export interface OverviewPeriodData {
  // From Setters (IG profile funnel)
  profileVisits: number;
  followers: number;
  qualifiedFollowers: number;
  messagesSent: number;
  linksSent: number;
  bookedCalls: number;

  // From Closers
  shows: number;
  offersMade: number;
  closed: number;
  revenue: number;
  cashCollected: number;

  // From Ads
  adSpend: number;
  leads: number;

  // Conversion rates (9-stage pipeline)
  followerRate: number;      // followers / profileVisits
  qualifiedRate: number;     // qualifiedFollowers / followers
  messageRate: number;       // messagesSent / qualifiedFollowers
  linkRate: number;          // linksSent / messagesSent
  bookingRate: number;       // bookedCalls / linksSent
  showRate: number;          // shows / bookedCalls
  offerRate: number;         // offersMade / shows
  closeRate: number;         // closed / offersMade
  overallConversion: number; // closed / profileVisits

  // Financial
  cac: number;
  roi: number;
}

// --- Trend ---
export interface TrendInfo {
  change: number;
  direction: "up" | "down" | "flat";
}

// --- Period Selection ---
export type PeriodType = "daily" | "weekly" | "monthly";

export interface DateRange {
  start: string;
  end: string;
}

// --- Overview Chart Data ---
export interface OverviewChartDataPoint {
  date: string;
  label: string;
  profileVisits: number;
  followers: number;
  qualifiedFollowers: number;
  messagesSent: number;
  linksSent: number;
  bookedCalls: number;
  shows: number;
  offersMade: number;
  closed: number;
  revenue: number;
}

// --- Dashboard Sections (used for Google Sheet tabs) ---
export type DashboardSection = "overview" | "setters" | "closers" | "ads" | "payments";

// --- Setter Data Row (matches Setters sheet tab) ---
export interface SetterDataRow {
  date: string;
  name: string;
  messagesSent: number;
  outbounds: number;
  inbounds: number;
  followUps: number;
  linksSent: number;
  bookedCalls: number;
  callsProposed: number;
  followers: number;
  qualifiedFollowers: number;
  leadQuality: string;
  notes: string;
  hitKpis: string;
  profileVisits: number;
}

export interface SetterPeriodData {
  messagesSent: number;
  outbounds: number;
  inbounds: number;
  followUps: number;
  linksSent: number;
  bookedCalls: number;
  callsProposed: number;
  followers: number;
  qualifiedFollowers: number;
  totalActivity: number;
  outboundToLinkRate: number;
  linkToBookRate: number;
  kpiHitRate: number;
}

export interface SetterChartDataPoint {
  date: string;
  label: string;
  messagesSent: number;
  outbounds: number;
  linksSent: number;
  bookedCalls: number;
}

// --- Closer Data Row (matches Closers sheet tab) ---
export interface CloserDataRow {
  date: string;
  name: string;
  callsScheduled: number;
  shows: number;
  noShows: number;
  offersMade: number;
  closed: number;
  revenue: number;
  cashCollected: number;
  followUpCalls: number;
  rescheduled: number;
  avgDealValue: number;
  objections: string;
  notes: string;
}

export interface CloserPeriodData {
  callsScheduled: number;
  shows: number;
  noShows: number;
  offersMade: number;
  closed: number;
  revenue: number;
  cashCollected: number;
  followUpCalls: number;
  rescheduled: number;
  showRate: number;
  offerRate: number;
  closeRate: number;
  cashCollectedRatio: number;
  noShowRate: number;
  avgDealValue: number;
  cashPerBooking: number;
  cashPerAttended: number;
}

export interface CloserChartDataPoint {
  date: string;
  label: string;
  shows: number;
  offersMade: number;
  closed: number;
  revenue: number;
}

// --- Ad Data Row (matches Ads sheet tab) ---
export interface AdDataRow {
  date: string;
  platform: string;
  campaign: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  cpc: number;
  leads: number;
  cpl: number;
  bookedCalls: number;
  roas: number;
  notes: string;
}

export interface AdPeriodData {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  totalBookedCalls: number;
  avgCtr: number;
  avgCpc: number;
  avgCpm: number;
  blendedCpl: number;
  blendedRoas: number;
  leadToCallRate: number;
}

export interface AdChartDataPoint {
  date: string;
  label: string;
  spend: number;
  leads: number;
  cpl: number;
  bookedCalls: number;
}

// --- Payment Data Row (matches Payments sheet tab) ---
export interface PaymentDataRow {
  date: string;
  clientName: string;
  downPayment: number;
  paymentMethod: string;
  status: string;
  programme: string;
  paymentType: string;
  totalContracted: number;
  revenue: number;
  dueDate: string;
  recurring: string;
  stripeId: string;
  notes: string;
}

export interface PaymentPeriodData {
  totalCollected: number;
  totalOutstanding: number;
  totalRefunded: number;
  totalPending: number;
  activePaymentPlans: number;
  pifCount: number;
  installmentCount: number;
  revenueByProgramme: Record<string, number>;
  statusCounts: Record<string, number>;
}

// --- Section Data (in API response) ---
export interface SetterSectionData {
  current: SetterPeriodData;
  previous: SetterPeriodData;
  rows: SetterDataRow[];
  chartData: SetterChartDataPoint[];
}

export interface CloserSectionData {
  current: CloserPeriodData;
  previous: CloserPeriodData;
  rows: CloserDataRow[];
  chartData: CloserChartDataPoint[];
}

export interface AdSectionData {
  current: AdPeriodData;
  previous: AdPeriodData;
  rows: AdDataRow[];
  chartData: AdChartDataPoint[];
}

export interface PaymentSectionData {
  current: PaymentPeriodData;
  previous: PaymentPeriodData;
  rows: PaymentDataRow[];
}

// --- Overview Section Data ---
export interface OverviewSectionData {
  current: OverviewPeriodData;
  previous: OverviewPeriodData;
  chartData: OverviewChartDataPoint[];
}

// --- API Response ---
export interface DashboardResponse {
  clientName: string;
  brandColor: string;
  period: PeriodType;
  dateRange: DateRange;
  section: DashboardSection;
  // Overview
  overview?: OverviewSectionData;
  // Sections
  setters?: SetterSectionData;
  closers?: CloserSectionData;
  ads?: AdSectionData;
  payments?: PaymentSectionData;
}

// --- Auth ---
export interface AuthPayload {
  clientId: string;
  exp: number;
}
