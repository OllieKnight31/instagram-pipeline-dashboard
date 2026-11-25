"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Lock } from "lucide-react";
import { CreditLink } from "@/components/credit-link";

const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || "Pipeline Dashboard";

/** Only shown when ACCESS_PASSWORD is set. Without it there is no login at all. */
export function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter the password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || "Wrong password");
        return;
      }
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight">{brandName}</h1>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <BarChart3 className="h-4 w-4" />
          <span className="text-sm">Pipeline Dashboard</span>
        </div>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardDescription>This dashboard is private. Enter the password to view it.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter the password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Checking..." : "View Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <CreditLink className="mt-8" />
    </div>
  );
}
