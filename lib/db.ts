// lib/db.ts - Main database interface
import { DatabaseAdapter } from "@/types";
import PostgresAdapter from "./db-postgres";
import FirebaseAdapter from "./db-firebase";

// Create the appropriate adapter based on environment variable
function createDatabaseAdapter(): DatabaseAdapter {
  const dbType = process.env.DATABASE_TYPE || "postgres";

  switch (dbType.toLowerCase()) {
    case "firebase":
      return new FirebaseAdapter();
    case "postgres":
    case "postgresql":
      return new PostgresAdapter();
    default:
      console.warn(
        `Unknown database type: ${dbType}, defaulting to PostgreSQL`
      );
      return new PostgresAdapter();
  }
}

// Export singleton instance
export const dbAdapter = createDatabaseAdapter();

// Export convenience functions (same API as before)
export async function initDB() {
  return dbAdapter.initDB();
}

export async function saveMessage(
  content: string,
  direction: "incoming" | "outgoing",
  fromNumber?: string,
  toNumber?: string,
  contactName?: string
) {
  return dbAdapter.saveMessage(
    content,
    direction,
    fromNumber,
    toNumber,
    contactName
  );
}

export async function getMessages() {
  return dbAdapter.getMessages();
}

export async function getMessagesByContact(contactPhone: string) {
  return dbAdapter.getMessagesByContact(contactPhone);
}

// Contact management functions
export async function getContacts() {
  return dbAdapter.getContacts();
}

export async function getContactById(id: string) {
  return dbAdapter.getContactById(id);
}

export async function saveContact(contact: any) {
  return dbAdapter.saveContact(contact);
}

export async function updateContact(contact: any) {
  return dbAdapter.updateContact(contact);
}

export async function deleteContact(id: string) {
  return dbAdapter.deleteContact(id);
}
