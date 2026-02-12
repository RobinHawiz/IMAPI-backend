import dotenv from "dotenv";

/**
 * Loads environment variables from a `.env` file into `process.env`.
 *
 * This file is imported for its side effect only and should be the
 * first thing executed in the application lifecycle to ensure all
 * config is available before other modules are loaded.
 */
dotenv.config();
