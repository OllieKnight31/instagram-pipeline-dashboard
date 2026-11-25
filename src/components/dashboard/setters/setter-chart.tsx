"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import type { SetterChartDataPoint } from "@/types/dashboard";

const METRIC_CONFIG: Record<string, { color: string; label: string }> = {
  messagesSent: { color: "var(--chart-1)", label: "Messages Sent" },
  outbounds: { color: "var(--chart-2)", label: "Outbounds" },
  linksSent: { color: "var(--chart-3)", label: "Links Sent" },
  bookedCalls: { color: "var(--chart-4)", label: "Booked Calls" },
};

interface SetterChartProps {
  data: SetterChartDataPoint[];
}

export function SetterChart({ data }: SetterChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Setter Trends</h3>
        <div className="flex items-center justify-center h-[300px] text-muted-foreground">
          No data available for this period
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Setter Trends</h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--foreground)",
              fontSize: "13px",
            }}
          />
          <Legend />
          {Object.entries(METRIC_CONFIG).map(([metric, config]) => (
            <Line
              key={metric}
              type="monotone"
              dataKey={metric}
              name={config.label}
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
