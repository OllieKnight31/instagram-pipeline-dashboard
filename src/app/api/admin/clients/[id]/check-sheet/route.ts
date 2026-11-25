import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getClientById } from "@/lib/db";
import { validateSheet } from "@/lib/sheet-validation";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await getAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const client = await getClientById(id);
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  try {
    const result = await validateSheet(client.sheetId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Sheet check error:", error);
    return NextResponse.json(
      { error: "Failed to check sheet" },
      { status: 500 }
    );
  }
}
