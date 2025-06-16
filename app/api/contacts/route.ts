// app/api/contacts/route.ts - Enhanced with CRUD operations
import { NextRequest, NextResponse } from "next/server";
import { approvedContacts, EnhancedContact } from "../../../lib/contacts";
import { findUserByPassword } from "../../../lib/user-management";

// In-memory storage for now - can move to Firebase later
const dynamicContacts: EnhancedContact[] = [...approvedContacts];

export async function GET(request: NextRequest) {
  // Get auth token from cookie
  const authToken = request.cookies.get("pait_auth")?.value;

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

  return NextResponse.json({
    contacts: dynamicContacts,
    user: {
      name: user.name,
      role: user.role,
    },
  });
}

// POST - Add new contact (admin only)
export async function POST(request: NextRequest) {
  const authToken = request.cookies.get("pait_auth")?.value;

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
    const existingContact = dynamicContacts.find(
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

    dynamicContacts.push(newContact);

    return NextResponse.json({
      success: true,
      message: "Contact added successfully",
      contact: newContact,
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
  const authToken = request.cookies.get("pait_auth")?.value;

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

    // Find and update contact
    const contactIndex = dynamicContacts.findIndex(
      (c) => c.id === updatedContact.id
    );
    if (contactIndex === -1) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // Update methods based on email presence
    updatedContact.methods = ["sms"];
    if (updatedContact.email && updatedContact.email.trim() !== "") {
      updatedContact.methods.push("email");
    }

    dynamicContacts[contactIndex] = updatedContact;

    return NextResponse.json({
      success: true,
      message: "Contact updated successfully",
      contact: updatedContact,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update contact" },
      { status: 500 }
    );
  }
}

// DELETE - Remove contact (admin only)
export async function DELETE(request: NextRequest) {
  const authToken = request.cookies.get("pait_auth")?.value;

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

    const contactIndex = dynamicContacts.findIndex((c) => c.id === contactId);
    if (contactIndex === -1) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    const deletedContact = dynamicContacts[contactIndex];
    dynamicContacts.splice(contactIndex, 1);

    return NextResponse.json({
      success: true,
      message: "Contact deleted successfully",
      contact: deletedContact,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete contact" },
      { status: 500 }
    );
  }
}
