// app/api/auth/refresh/route.ts - Session refresh endpoint
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByPassword } from "@/lib/user-management";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("pait_auth")?.value;

    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Validate the token
    const user = findUserByPassword(authToken);

    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    // Refresh cookies with new expiration
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax" as const,
      maxAge: 14400, // 4 hours in seconds
      path: "/",
    };

    // Update both cookies with new expiration
    cookieStore.set("pait_auth", authToken, cookieOptions);
    cookieStore.set(
      "pait_user",
      JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role,
        emoji: user.emoji,
      }),
      cookieOptions
    );

    return NextResponse.json({ success: true, refreshed: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to refresh session" },
      { status: 500 }
    );
  }
}
