import DatabaseConstructor, { Database } from "better-sqlite3";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Connects to a SQLite database.
 *
 * @returns A SQLite database connection
 * @throws If the database connection failed
 */
export default function connectToSQLiteDb(): Database {
  try {
    const dbPath = process.env.DATABASE;
    if (!dbPath) {
      throw new Error("Failed to create db: Missing DATABASE in .env");
    }
    const dbConnection = new DatabaseConstructor(resolve(__dirname, dbPath), {
      verbose: console.log,
    });
    dbConnection.pragma("foreign_keys = ON");
    return dbConnection;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
}
