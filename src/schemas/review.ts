import { JSONSchemaType } from "ajv";
import { ReviewCreatePayload, ReviewUpdatePayload } from "@models/review.js";

/**
 * Params validation schema for routes with `:reviewId`.
 *
 * - `reviewId`: non-empty string
 *
 */
export const reviewIdParamSchema: JSONSchemaType<{ reviewId: string }> = {
  type: "object",
  properties: {
    reviewId: { type: "string", minLength: 1 },
  },
  required: ["reviewId"],
};

/**
 * Params validation schema for routes with `:tmdbMovieId`.
 *
 * - `tmdbMovieId`: non-empty string
 *
 */
export const tmdbMovieIdParamSchema: JSONSchemaType<{ tmdbMovieId: string }> = {
  type: "object",
  properties: {
    tmdbMovieId: { type: "string", minLength: 1 },
  },
  required: ["tmdbMovieId"],
};

/**
 * Validation schema for review payload (create)
 *
 * Validates the request body to ensure required fields are present and formatted correctly:
 * - `tmdbMovieId`: non-empty string
 * - `tmdbMovieTitle`: non-empty string
 * - `title`: non-empty string, max 50 characters
 * - `reviewText`: non-empty string, min 50 characters, max 1000 characters
 * - `rating`: positive number between 1 and 10
 */
export const reviewCreatePayloadSchema: JSONSchemaType<ReviewCreatePayload> = {
  type: "object",
  properties: {
    tmdbMovieId: { type: "string", minLength: 1 },
    tmdbMovieTitle: { type: "string", minLength: 1 },
    title: { type: "string", maxLength: 50, minLength: 1 },
    reviewText: { type: "string", maxLength: 1000, minLength: 50 },
    rating: { type: "number", minimum: 1, maximum: 10 },
  },
  required: ["tmdbMovieId", "tmdbMovieTitle", "title", "reviewText", "rating"],
  additionalProperties: false,
};

/**
 * Validation schema for review payload (update)
 *
 * Validates the request body to ensure required fields are present and formatted correctly:
 * - `title`: non-empty string, max 50 characters
 * - `reviewText`: non-empty string, min 50 characters, max 1000 characters
 * - `rating`: positive number between 1 and 10
 */
export const reviewUpdatePayloadSchema: JSONSchemaType<ReviewUpdatePayload> = {
  type: "object",
  properties: {
    title: { type: "string", maxLength: 50, minLength: 1 },
    reviewText: { type: "string", maxLength: 1000, minLength: 50 },
    rating: { type: "number", minimum: 1, maximum: 10 },
  },
  required: ["title", "reviewText", "rating"],
  additionalProperties: false,
};
