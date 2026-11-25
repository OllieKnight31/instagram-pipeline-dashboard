import { format, subDays } from "date-fns";
import type {
  SetterDataRow, CloserDataRow, AdDataRow, PaymentDataRow,
} from "@/types/dashboard";

const SETTER_NAMES = ["Riley M", "Jordan K", "Sam P"];
const CLOSER_NAMES = ["Chris R", "Taylor B"];
const CAMPAIGNS = ["Cold - Testimonial", "Cold - VSL Hook", "Retarget - Case Study"];
const PROGRAMMES = ["Elite Mentorship", "Inner Circle", "VIP 1:1"];
const CLIENT_NAMES = ["James W", "Sarah L", "Mike T", "Emma R", "Dan H", "Lucy K", "Tom S", "Nina P"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateSetterRows(days: number): SetterDataRow[] {
  const rows: SetterDataRow[] = [];
  for (let i = days; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    for (const name of SETTER_NAMES) {
      const profileVisits = rand(80, 250);
      const followers = rand(8, 30);
      const qualifiedFollowers = rand(3, Math.min(followers, 15));
      const messagesSent = rand(15, 50);
      const outbounds = rand(10, 35);
      const inbounds = rand(2, 12);
      const followUps = rand(5, 20);
      const linksSent = rand(3, 12);
      const bookedCalls = rand(1, Math.min(linksSent, 5));
      rows.push({
        date, name,
        messagesSent, outbounds, inbounds, followUps,
        linksSent, bookedCalls,
        callsProposed: rand(bookedCalls, bookedCalls + 3),
        followers, qualifiedFollowers,
        profileVisits,
        leadQuality: ["A", "B", "B", "C"][rand(0, 3)],
        notes: "",
        hitKpis: rand(0, 3) > 0 ? "Yes" : "No",
      });
    }
  }
  return rows;
}

function generateCloserRows(days: number): CloserDataRow[] {
  const rows: CloserDataRow[] = [];
  for (let i = days; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    for (const name of CLOSER_NAMES) {
      const callsScheduled = rand(3, 8);
      const noShows = rand(0, 2);
      const shows = Math.max(0, callsScheduled - noShows);
      const offersMade = rand(Math.max(0, shows - 2), shows);
      const closed = rand(0, Math.min(offersMade, 2));
      const dealValue = rand(3000, 8000);
      const revenue = closed * dealValue;
      const cashCollected = Math.round(revenue * (rand(40, 100) / 100));
      rows.push({
        date, name,
        callsScheduled, shows, noShows, offersMade, closed,
        revenue, cashCollected,
        followUpCalls: rand(1, 4),
        rescheduled: rand(0, 2),
        avgDealValue: closed > 0 ? dealValue : 0,
        objections: ["Price", "Timing", "Need to think", ""][rand(0, 3)],
        notes: "",
      });
    }
  }
  return rows;
}

function generateAdRows(days: number): AdDataRow[] {
  const rows: AdDataRow[] = [];
  for (let i = days; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    for (const campaign of CAMPAIGNS) {
      const spend = rand(30, 120);
      const impressions = rand(2000, 8000);
      const clicks = rand(40, 200);
      const leads = rand(1, 6);
      const ctr = (clicks / impressions) * 100;
      const cpc = spend / clicks;
      const cpm = (spend / impressions) * 1000;
      const cpl = spend / leads;
      const bookedCalls = rand(0, Math.min(leads, 2));
      rows.push({
        date, platform: "Meta",
        campaign, spend, impressions, clicks,
        ctr: Math.round(ctr * 100) / 100,
        cpm: Math.round(cpm * 100) / 100,
        cpc: Math.round(cpc * 100) / 100,
        leads, cpl: Math.round(cpl * 100) / 100,
        bookedCalls,
        roas: Math.round((leads * 5000 / spend) * 100) / 100,
        notes: "",
      });
    }
  }
  return rows;
}

function generatePaymentRows(days: number): PaymentDataRow[] {
  const rows: PaymentDataRow[] = [];
  for (let i = days; i >= 0; i -= rand(1, 4)) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const client = CLIENT_NAMES[rand(0, CLIENT_NAMES.length - 1)];
    const programme = PROGRAMMES[rand(0, PROGRAMMES.length - 1)];
    const isPif = rand(0, 2) === 0;
    const totalContracted = rand(3000, 10000);
    const downPayment = isPif ? totalContracted : rand(1000, Math.round(totalContracted / 2));
    const status = rand(0, 5) === 0 ? "Pending" : "Paid";
    rows.push({
      date, clientName: client,
      downPayment,
      paymentMethod: ["Stripe", "Bank Transfer", "Stripe"][rand(0, 2)],
      status,
      programme,
      paymentType: isPif ? "PIF" : "Installment",
      totalContracted,
      revenue: totalContracted,
      dueDate: isPif ? "" : format(subDays(new Date(), i - 30), "yyyy-MM-dd"),
      recurring: isPif ? "No" : "Yes",
      stripeId: status === "Paid" ? `pi_${rand(100000, 999999)}` : "",
      notes: "",
    });
  }
  return rows;
}

// Cache demo data per request lifecycle so all sections see the same data
let cachedData: {
  setters: SetterDataRow[];
  closers: CloserDataRow[];
  ads: AdDataRow[];
  payments: PaymentDataRow[];
} | null = null;

export function getDemoData() {
  if (!cachedData) {
    cachedData = {
      setters: generateSetterRows(45),
      closers: generateCloserRows(45),
      ads: generateAdRows(45),
      payments: generatePaymentRows(45),
    };
  }
  return cachedData;
}
