// lib/db-postgres.ts
import { Pool } from "pg";
import { DatabaseAdapter, Message, EnhancedContact } from "@/types";
import { approvedContacts } from "./contacts";

class PostgresAdapter implements DatabaseAdapter {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async initDB() {
    const client = await this.pool.connect();
    try {
      // Create messages table
      await client.query(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          direction VARCHAR(10) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          from_number VARCHAR(20),
          to_number VARCHAR(20),
          contact_name VARCHAR(100)
        )
      `);

      // Create contacts table
      await client.query(`
        CREATE TABLE IF NOT EXISTS contacts (
          id VARCHAR(50) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          email VARCHAR(255),
          emoji VARCHAR(10),
          approved BOOLEAN DEFAULT TRUE,
          methods TEXT[] NOT NULL
        )
      `);

      // Initialize default contacts if table is empty
      const contactCount = await client.query('SELECT COUNT(*) FROM contacts');
      if (parseInt(contactCount.rows[0].count) === 0) {
        console.log('Initializing default contacts in PostgreSQL');
        for (const contact of approvedContacts) {
          await client.query(
            `INSERT INTO contacts (id, name, phone, email, emoji, approved, methods)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              contact.id,
              contact.name,
              contact.phone,
              contact.email || null,
              contact.emoji || '👤',
              contact.approved,
              contact.methods,
            ]
          );
        }
      }
    } finally {
      client.release();
    }
  }

  async saveMessage(
    content: string,
    direction: "incoming" | "outgoing",
    fromNumber?: string,
    toNumber?: string,
    contactName?: string
  ): Promise<Message> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        "INSERT INTO messages (content, direction, from_number, to_number, contact_name) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [content, direction, fromNumber, toNumber, contactName]
      );
      const row = result.rows[0];
      return {
        id: row.id.toString(),
        content: row.content,
        direction: row.direction,
        timestamp: row.timestamp,
        from_number: row.from_number,
        to_number: row.to_number,
        contact_name: row.contact_name,
      };
    } finally {
      client.release();
    }
  }

  async getMessages(): Promise<Message[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM messages ORDER BY timestamp DESC LIMIT 50"
      );
      return result.rows.map((row) => ({
        id: row.id.toString(),
        content: row.content,
        direction: row.direction,
        timestamp: row.timestamp,
        from_number: row.from_number,
        to_number: row.to_number,
        contact_name: row.contact_name,
      }));
    } finally {
      client.release();
    }
  }

  async getMessagesByContact(contactPhone: string): Promise<Message[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        "SELECT * FROM messages WHERE from_number = $1 OR to_number = $1 ORDER BY timestamp DESC LIMIT 20",
        [contactPhone]
      );
      return result.rows.map((row) => ({
        id: row.id.toString(),
        content: row.content,
        direction: row.direction,
        timestamp: row.timestamp,
        from_number: row.from_number,
        to_number: row.to_number,
        contact_name: row.contact_name,
      }));
    } finally {
      client.release();
    }
  }

  // Contact management methods
  async getContacts(): Promise<EnhancedContact[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM contacts ORDER BY name');
      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        emoji: row.emoji,
        approved: row.approved,
        methods: row.methods,
      }));
    } finally {
      client.release();
    }
  }

  async getContactById(id: string): Promise<EnhancedContact | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM contacts WHERE id = $1', [id]);
      if (result.rows.length === 0) return null;

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        phone: row.phone,
        email: row.email,
        emoji: row.emoji,
        approved: row.approved,
        methods: row.methods,
      };
    } finally {
      client.release();
    }
  }

  async saveContact(contact: EnhancedContact): Promise<EnhancedContact> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `INSERT INTO contacts (id, name, phone, email, emoji, approved, methods)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          contact.id,
          contact.name,
          contact.phone,
          contact.email || null,
          contact.emoji || '👤',
          contact.approved,
          contact.methods,
        ]
      );
      return contact;
    } finally {
      client.release();
    }
  }

  async updateContact(contact: EnhancedContact): Promise<EnhancedContact> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `UPDATE contacts
         SET name = $2, phone = $3, email = $4, emoji = $5, approved = $6, methods = $7
         WHERE id = $1`,
        [
          contact.id,
          contact.name,
          contact.phone,
          contact.email || null,
          contact.emoji || '👤',
          contact.approved,
          contact.methods,
        ]
      );
      return contact;
    } finally {
      client.release();
    }
  }

  async deleteContact(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('DELETE FROM contacts WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }
}

export default PostgresAdapter;
