// Load environment variables
import "./src/config/env.js";
import bcrypt from "bcrypt";

import DatabaseConstructor, { Database } from "better-sqlite3";

let db: Database | undefined;

try {
  // Connect to db
  const dbPath = process.env.DATABASE_INSTALL_PATH;
  if (!dbPath) {
    throw new Error("Failed to create db: Missing DATABASE in .env");
  }
  db = new DatabaseConstructor(dbPath);
  db.pragma("foreign_keys = ON");

  // Create table user
  db.exec("drop table if exists user;");

  db.exec(`CREATE TABLE user(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL
        );`);

  // Create table review
  db.exec("drop table if exists review;");

  db.exec(`CREATE TABLE review(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        tmdb_movie_id TEXT NOT NULL,
        title TEXT NOT NULL,
        review_text TEXT NOT NULL,
        rating INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id)
        );`);

  // Create table review_like
  db.exec("drop table if exists review_like;");

  db.exec(`CREATE TABLE review_like(
        user_id INTEGER NOT NULL,
        review_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id),
        FOREIGN KEY (review_id) REFERENCES review(id),
        PRIMARY KEY (user_id, review_id)
        );`);

  console.log("DB initialized at:", dbPath);
} catch (e) {
  console.error("---ERROR---");
  console.error(e instanceof Error ? e.message : e);
} finally {
  if (db) db.close();
}
