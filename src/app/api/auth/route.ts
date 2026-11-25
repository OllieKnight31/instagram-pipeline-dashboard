import { NextRequest, NextResponse } from "next/server";
import { verifyAccessPassword, createSession, clearSession, PASSWORD_REQUIRED } from "@/lib/auth";

/** Only used when ACCESS_PASSWORD is set. Without it the dashboard is open. */
export async function POST(request: NextRequest) {
  try {
    if (!PASSWORD_REQUIRED) return NextResponse.json({ success: true });
    const { password } = await request.json();
    if (!password || !(await verifyAccessPassword(password))) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }
    await createSession();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Sign in failed" }, { status: 500 });
  }
}

export async function DELETE() {
  await clearSession();
  return NextResponse.json({ success: true });
}
