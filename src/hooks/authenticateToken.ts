import { FastifyRequest, FastifyReply, DoneFuncWithErrOrRes } from "fastify";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config();

/**
 * Hook to verify JWTs for protected routes.
 * Relies on `JWT_SECRET_KEY` from environment config for verification.
 */
export function authenticateToken(
  request: FastifyRequest,
  reply: FastifyReply,
  done: DoneFuncWithErrOrRes
) {
  const authHeader = request.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    reply
      .status(401)
      .send({ message: "Not authorized for this route - token missing!" });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY as string, (err) => {
    if (err) {
      reply.status(403).send({ message: "Not correct JWT!" });
      return;
    }
    done();
  });
}
