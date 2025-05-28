// lib/db-postgres.ts
import { Pool } from "pg";
import { DatabaseAdapter, Message } from "@/types";

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
}

export default PostgresAdapter;
