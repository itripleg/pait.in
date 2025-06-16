// app/api/auth/route.ts - Enhanced authentication
import { NextRequest, NextResponse } from "next/server";
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

    // Set auth cookie
    const response = NextResponse.json({
      success: true,
      message: `Welcome ${user.name}!`,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        emoji: user.emoji,
      },
    });

    // Set secure cookie with password (we validate this on each request)
    response.cookies.set("pait_auth", password, {
      httpOnly: false, // Allow client access for now
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}

// GET method to check current auth status
export async function GET(request: NextRequest) {
  const authToken = request.cookies.get("pait_auth")?.value;

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
