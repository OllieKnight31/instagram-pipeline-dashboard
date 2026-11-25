import { NextRequest, NextResponse } from "next/server";
import { validateSheet } from "@/lib/sheet-validation";
import { getServiceAccountEmail } from "@/lib/sheet-validation";

function extractSheetId(input: string): string {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { sheetId: rawSheetId } = await request.json();
    if (!rawSheetId) {
      return NextResponse.json({ error: "Sheet ID required" }, { status: 400 });
    }

    const sheetId = extractSheetId(rawSheetId);
    const result = await validateSheet(sheetId);
    const serviceAccountEmail = getServiceAccountEmail();

    return NextResponse.json({
      ...result,
      serviceAccountEmail,
    });
  } catch (error) {
    console.error("Sheet validation error:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
