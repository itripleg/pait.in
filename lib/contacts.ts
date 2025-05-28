// lib/contacts.ts - update this file
import { Contact } from "@/types";

// Hardcoded approved contacts
export const approvedContacts: Contact[] = [
  {
    id: "1",
    name: "Dad",
    phone: "+18287671055", // Updated with your number
    emoji: "👦🏽",
    approved: true,
  },
  {
    id: "2",
    name: "Mom",
    phone: "+18283550002", // Updated with mom's number
    emoji: "👩",
    approved: true,
  },
  {
    id: "3",
    name: "GingGing",
    phone: "+18283189701", // Updated with GingGing's number
    emoji: "👵",
    approved: true,
  },
  {
    id: "4",
    name: "WayWay",
    phone: "+18286331891", // Updated with WayWay's number
    emoji: "👴",
    approved: true,
  },
  {
    id: "5",
    name: "Emergency",
    phone: "+911",
    emoji: "🚨",
    approved: true,
  },
];

export function getContactByPhone(phone: string): Contact | undefined {
  return approvedContacts.find((contact) => contact.phone === phone);
}

export function getContactByName(name: string): Contact | undefined {
  return approvedContacts.find(
    (contact) => contact.name.toLowerCase() === name.toLowerCase()
  );
}
