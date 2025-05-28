// app/api/contacts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { approvedContacts } from "../../../lib/contacts";

export async function GET(request: NextRequest) {
  // Get auth token from cookie instead of URL parameter
  const authToken = request.cookies.get("pait_auth")?.value;

  if (!authToken || authToken !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    contacts: approvedContacts.filter((c) => c.approved),
  });
}
