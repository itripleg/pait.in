// app/api/contacts/route.ts - Next.js 16 with async cookies() API and database persistence
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { EnhancedContact } from "../../../lib/contacts";
import { findUserByPassword } from "../../../lib/user-management";
import { getContacts } from "../../../lib/db";

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

  try {
    const contacts = await getContacts();

    return NextResponse.json({
      contacts,
      user: {
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

// POST - Add new contact (admin only)
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pait_auth")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = findUserByPassword(authToken);
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const newContact: EnhancedContact = await request.json();

    // Basic validation
    if (!newContact.name || !newContact.phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      );
    }

    // Check for duplicate phone numbers
    const allContacts = await getContacts();
    const existingContact = allContacts.find(
      (c) => c.phone === newContact.phone
    );
    if (existingContact) {
      return NextResponse.json(
        { error: "Contact with this phone number already exists" },
        { status: 400 }
      );
    }

    // Ensure methods array is set correctly
    if (newContact.email && !newContact.methods.includes("email")) {
      newContact.methods.push("email");
    }
    if (!newContact.methods.includes("sms")) {
      newContact.methods.push("sms");
    }

    // Save to database
    const { saveContact } = await import("../../../lib/db");
    const savedContact = await saveContact(newContact);

    return NextResponse.json({
      success: true,
      message: "Contact added successfully",
      contact: savedContact,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to add contact" },
      { status: 500 }
    );
  }
}

// PUT - Update existing contact (admin only)
export async function PUT(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pait_auth")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = findUserByPassword(authToken);
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const updatedContact: EnhancedContact = await request.json();

    // Check if contact exists
    const { getContactById, updateContact } = await import("../../../lib/db");
    const existingContact = await getContactById(updatedContact.id);

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Update methods based on email presence
    updatedContact.methods = ["sms"];
    if (updatedContact.email && updatedContact.email.trim() !== "") {
      updatedContact.methods.push("email");
    }

    // Update in database
    const saved = await updateContact(updatedContact);

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully",
      contact: saved,
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE - Remove contact (admin only)
export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("pait_auth")?.value;

  if (!authToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = findUserByPassword(authToken);
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Admin access required" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const contactId = searchParams.get("id");

    if (!contactId) {
      return NextResponse.json(
        { error: "Contact ID required" },
        { status: 400 }
      );
    }

    // Check if contact exists
    const { getContactById, deleteContact } = await import("../../../lib/db");
    const existingContact = await getContactById(contactId);

    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Delete from database
    await deleteContact(contactId);

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
      contact: existingContact,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
