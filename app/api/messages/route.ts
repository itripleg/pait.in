// app/api/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getMessages, initDB } from "../../../lib/db";

export async function GET(request: NextRequest) {
  // Get auth token from cookie instead of URL parameter
  const authToken = request.cookies.get("pait_auth")?.value;

  if (!authToken || authToken !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await initDB();

  try {
    const messages = await getMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
