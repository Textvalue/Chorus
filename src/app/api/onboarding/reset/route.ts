// Restart onboarding: wipe the workspace so the app gate sends the user back to tuning.
import { NextResponse } from "next/server";
import { resetStore } from "@/lib/store";

export async function POST() {
  try {
    await resetStore();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "reset failed" },
      { status: 500 }
    );
  }
}
