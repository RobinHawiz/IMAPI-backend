import { diContainer } from "@fastify/awilix";
import { FastifyReply, FastifyRequest } from "fastify";
import { UserCredentials, UserPayload } from "@models/user.js";
import { DomainError } from "@errors/domainError.js";
import { UserService } from "@services/user.js";
import { decodeVerifiedTokenPayload } from "@utils/token.js";

export interface UserController {
  /** POST /api/users/login → 200, 400 bad request, 500 internal server error */
  loginUser(
    request: FastifyRequest<{ Body: UserCredentials }>,
    reply: FastifyReply,
  ): void;
  /** GET /api/users/me → 200, 400 bad request, 500 internal server error */
  getUser(request: FastifyRequest, reply: FastifyReply): void;
  /** POST /api/users/register → 201, 400 bad request, 500 internal server error */
  insertUser(
    request: FastifyRequest<{ Body: UserPayload }>,
    reply: FastifyReply,
  ): void;
}

export class DefaultUserController implements UserController {
  private readonly service: UserService;

  constructor() {
    this.service = diContainer.resolve("userService");
  }

  async loginUser(
    request: FastifyRequest<{ Body: UserPayload }>,
    reply: FastifyReply,
  ) {
    try {
      const token = await this.service.loginUser(request.body);
      reply.code(200).send(token);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error authenticating admin user:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error authenticating admin user:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  getUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = decodeVerifiedTokenPayload<{ id: string }>(request);
      const user = this.service.getUser(id);
      reply.code(200).send(user);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving user data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving user data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  async insertUser(
    request: FastifyRequest<{ Body: UserPayload }>,
    reply: FastifyReply,
  ) {
    try {
      const id = await this.service.insertUser(request.body);
      reply.code(201).header("Location", `/api/users/${id}`).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error inserting user data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error inserting user data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }
}
