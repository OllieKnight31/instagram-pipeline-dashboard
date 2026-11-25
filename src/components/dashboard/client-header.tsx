"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, LayoutGrid } from "lucide-react";

interface ClientHeaderProps {
  clientName: string;
  clientId: string;
  clients: { id: string; name: string }[];
}

export function ClientHeader({ clientName }: ClientHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-semibold">{clientName}</h1>
        </div>
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Manage dashboards</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
