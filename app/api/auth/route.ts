// app/api/auth/route.ts - Next.js 16 with async cookies() API
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByPassword } from "../../../lib/user-management";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "Password required" }, { status: 400 });
    }

    // Find user by password
    const user = findUserByPassword(password);

    if (!user) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Set cookies with consistent Lax policy for better compatibility
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
      httpOnly: false, // Allow client read access for UI components
      secure: isProduction,
      sameSite: "lax" as const, // Use Lax for better cross-site compatibility
      maxAge: 14400, // 4 hours in seconds
      path: "/",
    };

    // Use async cookies() API (Next.js 16)
    const cookieStore = await cookies();

    // Set auth cookie
    cookieStore.set("pait_auth", password, cookieOptions);

    // Set user info cookie for client-side access
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

    return NextResponse.json({
      success: true,
      message: `Welcome ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        emoji: user.emoji,
      },
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// GET method to check current auth status
export async function GET() {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pait_auth")?.value;

  if (!authToken) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = findUserByPassword(authToken);

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      emoji: user.emoji,
    },
  });
}
