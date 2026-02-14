import { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

/**
 * Decode JWT payload from `Authorization: Bearer <token>`.
 *
 * NOTE: This function does not verify the signature. Use only after verification.
 */
export function decodeTokenPayload<T>(request: FastifyRequest) {
  const token = request.headers["authorization"]!.split(" ")[1];
  return jwt.decode(token) as T;
}
