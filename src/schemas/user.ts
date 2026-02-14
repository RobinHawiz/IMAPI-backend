import { JSONSchemaType } from "ajv";
import { UserCredentials, UserPayload } from "@models/user.js";

/**
 * Validation schema for user payload
 *
 * Validates the request body to ensure required fields are present and formatted correctly:
 * - `firstName`: non-empty string, max 50 characters
 * - `lastName`: non-empty string, max 50 characters
 * - `username`: non-empty string, max 50 characters
 * - `password`: non-empty string, min 8 characters, max 100 characters
 */
export const userPayloadSchema: JSONSchemaType<UserPayload> = {
  type: "object",
  properties: {
    firstName: { type: "string", maxLength: 50, minLength: 1 },
    lastName: { type: "string", maxLength: 50, minLength: 1 },
    username: { type: "string", maxLength: 50, minLength: 1 },
    password: { type: "string", maxLength: 100, minLength: 8 },
  },
  required: ["firstName", "lastName", "username", "password"],
  additionalProperties: false,
};

/**
 * Validation schema for user login credentials
 *
 * Validates the request body to ensure required fields are present and formatted correctly:
 * - `username`: non-empty string, max 50 characters
 * - `password`: non-empty string, min 8 characters, max 100 characters
 */
export const userCredentialsSchema: JSONSchemaType<UserCredentials> = {
  type: "object",
  properties: {
    username: { type: "string", maxLength: 50, minLength: 1 },
    password: { type: "string", maxLength: 100, minLength: 8 },
  },
  required: ["username", "password"],
  additionalProperties: false,
};
