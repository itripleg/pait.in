// app/api/user-preferences/route.ts - Next.js 16 with async cookies() API
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findUserByPassword } from "../../../lib/user-management";

// In-memory storage for user preferences (replace with database in production)
const userPreferences = new Map<string, any>();

export async function GET() {
  // Get auth token from cookie using async cookies() API
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pait_auth")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = findUserByPassword(authToken);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  // Get user preferences
  const preferences = userPreferences.get(user.id) || {};

  return NextResponse.json(preferences);
}

export async function POST(request: NextRequest) {
  // Get auth token from cookie using async cookies() API
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pait_auth")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = findUserByPassword(authToken);
  if (!user) {
    return NextResponse.json(
      { error: "Invalid authentication" },
      { status: 401 }
    );
  }

  try {
    const updates = await request.json();

    // Get existing preferences
    const currentPreferences = userPreferences.get(user.id) || {};

    // Merge with updates
    const newPreferences = {
      ...currentPreferences,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Save preferences
    userPreferences.set(user.id, newPreferences);

    return NextResponse.json({
      success: true,
      preferences: newPreferences,
    });
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update preferences" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // Same as POST for now
  return POST(request);
}
