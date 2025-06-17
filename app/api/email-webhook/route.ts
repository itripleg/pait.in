// lib/contacts.ts - Updated with email support
import { Contact } from "@/types";

// Enhanced contact interface to support multiple communication methods
export interface EnhancedContact extends Contact {
  email?: string;
  methods: ("sms" | "email")[];
}

// Hardcoded approved contacts with multiple communication methods
export const approvedContacts: EnhancedContact[] = [
  {
    id: "1",
    name: "Dad",
    phone: "+18287671065",
    // email: "8287671065@vtext.com",
    email: "joshua.bell.828@gmail.com",
    emoji: "👦🏽",
    approved: true,
    methods: ["sms", "email"],
  },
  {
    id: "2",
    name: "Mom",
    phone: "+18283550002",
    email: "mom@example.com",
    emoji: "👩",
    approved: true,
    methods: ["sms", "email"],
  },
  {
    id: "3",
    name: "GingGing",
    phone: "+18283189701",
    email: "gingGing@example.com",
    emoji: "👵",
    approved: true,
    methods: ["sms", "email"],
  },
  {
    id: "4",
    name: "WayWay",
    phone: "+18286331891",
    email: "wayway@example.com",
    emoji: "👴",
    approved: true,
    methods: ["sms", "email"],
  },
  {
    id: "5",
    name: "Emergency",
    phone: "+911",
    emoji: "🚨",
    approved: true,
    methods: ["sms"], // Emergency only supports SMS
  },
];

export function getContactByPhone(phone: string): EnhancedContact | undefined {
  return approvedContacts.find((contact) => contact.phone === phone);
}

export function getContactByEmail(email: string): EnhancedContact | undefined {
  return approvedContacts.find(
    (contact) =>
      contact.email && contact.email.toLowerCase() === email.toLowerCase()
  );
}

export function getContactByName(name: string): EnhancedContact | undefined {
  return approvedContacts.find(
    (contact) => contact.name.toLowerCase() === name.toLowerCase()
  );
}
