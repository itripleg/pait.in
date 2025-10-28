// lib/db-firebase.ts
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  where,
  or,
  Timestamp,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { DatabaseAdapter, Message, EnhancedContact } from "@/types";
import { approvedContacts } from "./contacts";

class FirebaseAdapter implements DatabaseAdapter {
  private messagesCollection = collection(db, "messages");
  private contactsCollection = collection(db, "contacts");

  async initDB(): Promise<void> {
    // Firebase doesn't need table creation, collections are created automatically
    console.log("Firebase initialized");
  }

  async saveMessage(
    content: string,
    direction: "incoming" | "outgoing",
    fromNumber?: string,
    toNumber?: string,
    contactName?: string
  ): Promise<Message> {
    const messageData = {
      content,
      direction,
      timestamp: Timestamp.now(),
      from_number: fromNumber || null,
      to_number: toNumber || null,
      contact_name: contactName || null,
    };

    const docRef = await addDoc(this.messagesCollection, messageData);

    return {
      id: docRef.id,
      content,
      direction,
      timestamp: messageData.timestamp.toDate(),
      from_number: fromNumber,
      to_number: toNumber,
      contact_name: contactName,
    };
  }

  async getMessages(): Promise<Message[]> {
    const q = query(
      this.messagesCollection,
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        direction: data.direction,
        timestamp: data.timestamp.toDate(),
        from_number: data.from_number,
        to_number: data.to_number,
        contact_name: data.contact_name,
      };
    });
  }

  async getMessagesByContact(contactPhone: string): Promise<Message[]> {
    const q = query(
      this.messagesCollection,
      or(
        where("from_number", "==", contactPhone),
        where("to_number", "==", contactPhone)
      ),
      orderBy("timestamp", "desc"),
      limit(20)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        content: data.content,
        direction: data.direction,
        timestamp: data.timestamp.toDate(),
        from_number: data.from_number,
        to_number: data.to_number,
        contact_name: data.contact_name,
      };
    });
  }

  // Contact management methods
  async getContacts(): Promise<EnhancedContact[]> {
    try {
      const querySnapshot = await getDocs(this.contactsCollection);

      // If no contacts in database, initialize with hardcoded defaults
      if (querySnapshot.empty) {
        console.log("No contacts in database, initializing with defaults");
        await this.initializeDefaultContacts();
        // Fetch again after initialization
        const newSnapshot = await getDocs(this.contactsCollection);
        return newSnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        } as EnhancedContact));
      }

      return querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      } as EnhancedContact));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      return [];
    }
  }

  async getContactById(id: string): Promise<EnhancedContact | null> {
    try {
      const docRef = doc(this.contactsCollection, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          ...docSnap.data(),
          id: docSnap.id,
        } as EnhancedContact;
      }
      return null;
    } catch (error) {
      console.error("Error fetching contact:", error);
      return null;
    }
  }

  async saveContact(contact: EnhancedContact): Promise<EnhancedContact> {
    try {
      const contactRef = doc(this.contactsCollection, contact.id);
      await setDoc(contactRef, {
        name: contact.name,
        phone: contact.phone,
        email: contact.email || null,
        emoji: contact.emoji || "👤",
        approved: contact.approved,
        methods: contact.methods,
      });

      return contact;
    } catch (error) {
      console.error("Error saving contact:", error);
      throw new Error("Failed to save contact");
    }
  }

  async updateContact(contact: EnhancedContact): Promise<EnhancedContact> {
    try {
      const contactRef = doc(this.contactsCollection, contact.id);
      await setDoc(contactRef, {
        name: contact.name,
        phone: contact.phone,
        email: contact.email || null,
        emoji: contact.emoji || "👤",
        approved: contact.approved,
        methods: contact.methods,
      });

      return contact;
    } catch (error) {
      console.error("Error updating contact:", error);
      throw new Error("Failed to update contact");
    }
  }

  async deleteContact(id: string): Promise<void> {
    try {
      const contactRef = doc(this.contactsCollection, id);
      await deleteDoc(contactRef);
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw new Error("Failed to delete contact");
    }
  }

  // Helper method to initialize default contacts
  private async initializeDefaultContacts(): Promise<void> {
    try {
      for (const contact of approvedContacts) {
        const contactRef = doc(this.contactsCollection, contact.id);
        await setDoc(contactRef, {
          name: contact.name,
          phone: contact.phone,
          email: contact.email || null,
          emoji: contact.emoji || "👤",
          approved: contact.approved,
          methods: contact.methods,
        });
      }
      console.log("Default contacts initialized in Firebase");
    } catch (error) {
      console.error("Error initializing default contacts:", error);
    }
  }
}

export default FirebaseAdapter;
