import { NextResponse } from "next/server";
import { initDb } from "@/lib/db";
import { hasAccess } from "@/lib/auth";

export async function POST() {
  if (!(await hasAccess())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await initDb();
    return NextResponse.json({ success: true, message: "Database initialized" });
  } catch (error) {
    console.error("DB init error:", error);
    return NextResponse.json({ error: "Failed to initialize database" }, { status: 500 });
  }
}
