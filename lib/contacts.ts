// lib/contacts.ts - Contact management for Paitin
import { Contact } from "@/types";

// Enhanced contact interface to support multiple communication methods
export interface EnhancedContact extends Contact {
  email?: string;
  methods: ("sms" | "email")[];
}

// Approved contacts - Dad has email, others can be added later
export const approvedContacts: EnhancedContact[] = [
  {
    id: "1",
    name: "Dad",
    phone: "+18287671065",
    email: "joshua.bell.828@gmail.com",
    emoji: "👨",
    approved: true,
    methods: ["sms", "email"],
  },
  {
    id: "2",
    name: "Mom",
    phone: "+18283550002",
    emoji: "👩",
    approved: true,
    methods: ["sms"],
  },
  {
    id: "3",
    name: "GingGing",
    phone: "+18283189701",
    emoji: "👵",
    approved: true,
    methods: ["sms"],
  },
  {
    id: "4",
    name: "WayWay",
    phone: "+18286331891",
    emoji: "👴",
    approved: true,
    methods: ["sms"],
  },
  {
    id: "5",
    name: "Emergency",
    phone: "+911",
    emoji: "🚨",
    approved: true,
    methods: ["sms"],
  },
];

// These functions now fetch from database, but keep fallback to hardcoded contacts
export async function getContactByPhone(phone: string): Promise<EnhancedContact | undefined> {
  try {
    const { getContacts } = await import("./db");
    const contacts = await getContacts();
    return contacts.find((contact) => contact.phone === phone);
  } catch (error) {
    console.error("Error fetching contact by phone:", error);
    // Fallback to hardcoded contacts
    return approvedContacts.find((contact) => contact.phone === phone);
  }
}

export async function getContactByEmail(email: string): Promise<EnhancedContact | undefined> {
  try {
    const { getContacts } = await import("./db");
    const contacts = await getContacts();
    return contacts.find((contact) => contact.email?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error("Error fetching contact by email:", error);
    // Fallback to hardcoded contacts
    return approvedContacts.find((contact) => contact.email?.toLowerCase() === email.toLowerCase());
  }
}

export async function getContactByName(name: string): Promise<EnhancedContact | undefined> {
  try {
    const { getContacts } = await import("./db");
    const contacts = await getContacts();
    return contacts.find(
      (contact) => contact.name.toLowerCase() === name.toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching contact by name:", error);
    // Fallback to hardcoded contacts
    return approvedContacts.find(
      (contact) => contact.name.toLowerCase() === name.toLowerCase()
    );
  }
}
