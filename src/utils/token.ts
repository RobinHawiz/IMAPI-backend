import { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";

/**
 * Decode JWT payload from `Authorization: Bearer <token>`.
 *
 * NOTE: This function does not verify the signature.
 * Use only after the request has been verified by `authenticateToken` in a route hook.
 */
export function decodeVerifiedTokenPayload<T>(request: FastifyRequest) {
  const token = request.headers["authorization"]!.split(" ")[1];
  return jwt.decode(token) as T;
}

/**
 * Decode JWT payload from `Authorization: Bearer <token>` if present.
 *
 * Intended for routes where the token is optional and a missing token is
 * tolerated.
 *
 * NOTE: This function does not verify the token signature, so the returned
 * payload must be treated as untrusted unless the request was verified earlier.
 */
export function decodeUnsafeTokenPayload<T>(request: FastifyRequest) {
  const authHeader = request.headers["authorization"];
  if (!authHeader) {
    return;
  }
  const token = authHeader.split(" ")[1];
  return jwt.decode(token) as T;
}
