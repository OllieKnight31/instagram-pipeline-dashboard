import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getAllClients } from "@/lib/db";

export async function GET() {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const clients = await getAllClients();
    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Failed to list clients:", error);
    return NextResponse.json(
      { error: "Failed to fetch clients" },
      { status: 500 }
    );
  }
}
