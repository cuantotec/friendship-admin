import { Client } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set.");
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

export const db = {
  execute: async (query: string, params: unknown[] = []) => {
    try {
      const result = await client.query(query, params);
      return result;
    } catch (error) {
      console.error("Failed query:", query, "params:", params, error);
      throw error;
    }
  },
};
