// app/api/contacts/route.ts - make sure this exists and works
import { NextRequest, NextResponse } from "next/server";
import { approvedContacts } from "../../../lib/contacts";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get("password");

  if (password !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  return NextResponse.json({
    contacts: approvedContacts.filter((c) => c.approved),
  });
}
