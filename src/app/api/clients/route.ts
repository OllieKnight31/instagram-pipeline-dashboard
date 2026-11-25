import { NextResponse } from "next/server";
import { getClientList } from "@/lib/clients";

export async function GET() {
  try {
    const clients = await getClientList();
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Failed to list clients:", error);
    return NextResponse.json({ clients: [] });
  }
}
