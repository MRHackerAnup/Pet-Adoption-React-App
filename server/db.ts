import { drizzle } from "drizzle-orm/node-postgres";
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from "@shared/schema";

// Create a PostgreSQL pool with the DATABASE_URL environment variable
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create a Drizzle instance with the pool and schema
export const db = drizzle(pool, { schema });