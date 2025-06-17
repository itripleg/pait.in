// app/api/messages/route.ts - Fixed to use user management system
import { NextRequest, NextResponse } from "next/server";
import { getMessages, initDB } from "../../../lib/db";
import { findUserByPassword } from "../../../lib/user-management";

export async function GET(request: NextRequest) {
  // Get auth token from cookie
  const authToken = request.cookies.get("pait_auth")?.value;

  // Production debugging - log what cookies we're receiving
  if (process.env.NODE_ENV === "production") {
    console.log(
      "PROD DEBUG - /api/messages - All cookies:",
      request.cookies.toString()
    );
    console.log(
      "PROD DEBUG - /api/messages - Auth token:",
      authToken ? "present" : "missing"
    );
    console.log(
      "PROD DEBUG - /api/messages - Headers:",
      Object.fromEntries(request.headers.entries())
    );
  }

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate using user management system (same as other routes)
  const user = findUserByPassword(authToken);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  await initDB();

  try {
    const messages = await getMessages();
    return NextResponse.json({
      messages,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
