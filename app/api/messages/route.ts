// app/api/messages/route.ts - Fixed to use user management system
import { NextRequest, NextResponse } from "next/server";
import { getMessages, initDB } from "../../../lib/db";
import { findUserByPassword } from "../../../lib/user-management";

export async function GET(request: NextRequest) {
  // Get auth token from cookie
  const authToken = request.cookies.get("pait_auth")?.value;

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
