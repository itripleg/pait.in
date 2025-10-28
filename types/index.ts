// types/index.ts - Update to be more flexible
export interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  emoji?: string;
  approved: boolean;
}

export interface EnhancedContact extends Contact {
  email?: string;
  methods: ("sms" | "email")[];
}

export interface Message {
  id: string | number; // Allow both string (Firebase) and number (PostgreSQL)
  content: string;
  direction: "incoming" | "outgoing";
  timestamp: string | Date; // Allow both string and Date
  from_number?: string;
  to_number?: string;
  contact_name?: string;
}

export interface DatabaseAdapter {
  initDB(): Promise<void>;
  saveMessage(
    content: string,
    direction: "incoming" | "outgoing",
    fromNumber?: string,
    toNumber?: string,
    contactName?: string
  ): Promise<Message>;
  getMessages(): Promise<Message[]>;
  getMessagesByContact(contactPhone: string): Promise<Message[]>;

  // Contact management methods
  getContacts(): Promise<EnhancedContact[]>;
  getContactById(id: string): Promise<EnhancedContact | null>;
  saveContact(contact: EnhancedContact): Promise<EnhancedContact>;
  updateContact(contact: EnhancedContact): Promise<EnhancedContact>;
  deleteContact(id: string): Promise<void>;
}
