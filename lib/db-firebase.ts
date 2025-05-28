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
} from "firebase/firestore";
import { db } from "./firebase";
import { DatabaseAdapter, Message } from "@/types";

class FirebaseAdapter implements DatabaseAdapter {
  private messagesCollection = collection(db, "messages");

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
}

export default FirebaseAdapter;
