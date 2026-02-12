import { diContainer } from "@fastify/awilix";
import { FastifyInstance } from "fastify";
import { userPayloadSchema } from "@schemas/user.js";
import { UserPayload } from "@models/user.js";
import { UserController } from "@controllers/user.js";
import { authenticateToken } from "@hooks/authenticateToken.js";

export interface UserRoutes {
  initRoutes(app: FastifyInstance): void;
}

export class DefaultUserRoutes implements UserRoutes {
  private readonly controller: UserController;

  constructor() {
    this.controller = diContainer.resolve("userController");
  }

  initRoutes(app: FastifyInstance) {
    // Authenticates a user and returns a JWT if successful
    app.post<{ Body: UserPayload }>(
      "/api/users/login",
      {
        schema: {
          body: userPayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.loginUser(request, reply);
      },
    );

    // Validates the JWT
    app.get(
      "/api/auth",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
      },
      (_, reply) => {
        reply.code(200).send();
      },
    );

    // Fetches a user after validating the JWT
    app.get(
      "/api/users/me",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
      },
      (request, reply) => {
        this.controller.getOneUser(request, reply);
      },
    );

    // Inserts a user after validating the request body
    app.post<{ Body: UserPayload }>(
      "/api/users/register",
      {
        schema: {
          body: userPayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.insertUser(request, reply);
      },
    );
  }
}
