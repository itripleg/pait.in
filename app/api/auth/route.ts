// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === process.env.APP_PASSWORD) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
}
