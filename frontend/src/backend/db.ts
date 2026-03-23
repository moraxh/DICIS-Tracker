import path from "node:path";
import Database from "better-sqlite3";

// Initialize the SQLite database connection
const dbPath = path.join(process.cwd(), "src", "data.db");
export const db = new Database(dbPath, { readonly: true });
