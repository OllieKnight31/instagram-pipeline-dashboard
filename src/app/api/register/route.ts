import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createClient, clientExists } from "@/lib/db";
import { validateSheet } from "@/lib/sheet-validation";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
}

function extractSheetId(input: string): string {
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : input.trim();
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await getAdminSession();
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, sheetId: rawSheetId, brandColor } = body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Business name is required (min 2 characters)" },
        { status: 400 }
      );
    }


    if (!rawSheetId || typeof rawSheetId !== "string") {
      return NextResponse.json(
        { error: "Google Sheet ID is required" },
        { status: 400 }
      );
    }

    const sheetId = extractSheetId(rawSheetId);
    if (!sheetId || sheetId.length < 10) {
      return NextResponse.json(
        { error: "Invalid Google Sheet ID" },
        { status: 400 }
      );
    }

    const slug = slugify(name.trim());
    if (!slug) {
      return NextResponse.json(
        { error: "Could not generate a valid ID from that name" },
        { status: 400 }
      );
    }

    if (await clientExists(slug)) {
      return NextResponse.json(
        { error: `Client ID "${slug}" is already taken. Try a different name.` },
        { status: 409 }
      );
    }

    const sheetResult = await validateSheet(sheetId);
    if (!sheetResult.valid) {
      const msg = sheetResult.error
        ? sheetResult.error
        : `Missing required tabs: ${sheetResult.missingTabs.join(", ")}. Sheet needs: Setters, Closers, Ads, Payments.`;
      return NextResponse.json({ error: msg }, { status: 422 });
    }

    await createClient({
      id: slug,
      name: name.trim(),
      sheetId,
      brandColor: brandColor || "#3b82f6",
    });

    return NextResponse.json({
      success: true,
      clientId: slug,
      sheetUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
