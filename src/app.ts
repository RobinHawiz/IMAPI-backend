import "@config/env.js"; // Load environment variables
import { diContainer } from "@fastify/awilix"; // DI
import * as awilix from "awilix"; // DI
import Fastify from "fastify";
import cors from "@fastify/cors";
import connectToSQLiteDb from "@config/db.js";
import { DefaultReviewRoutes, DefaultUserRoutes } from "@routes/index.js";
import { DefaultUserController } from "@controllers/index.js";
import { DefaultUserService } from "@services/index.js";
import { SQLiteUserRepository } from "@repositories/index.js";
import { DefaultReviewController } from "@controllers/review.js";
import { DefaultReviewService } from "@services/review.js";
import { SQLiteReviewRepository } from "@repositories/review.js";

// Bootstraps Fastify, registers DI, mounts routes.
export default async function build() {
  // Instantiate and configure the framework
  const app = Fastify({
    logger: true,
  });

  // Configure CORS origin
  app.register(cors, {
    origin: process.env.CORS_ORIGINS ?? "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    exposedHeaders: ["Location"],
  });

  // DI setup
  diContainer.register({
    db: awilix
      .asFunction(connectToSQLiteDb)
      .singleton()
      .disposer((db) => db.close()),
    userController: awilix.asClass(DefaultUserController).singleton(),
    userService: awilix.asClass(DefaultUserService).singleton(),
    userRepo: awilix.asClass(SQLiteUserRepository).singleton(),
    reviewController: awilix.asClass(DefaultReviewController).singleton(),
    reviewService: awilix.asClass(DefaultReviewService).singleton(),
    reviewRepo: awilix.asClass(SQLiteReviewRepository).singleton(),
  });

  // Mount routes
  const userRoutes = new DefaultUserRoutes();
  const reviewRoutes = new DefaultReviewRoutes();

  userRoutes.initRoutes(app);
  reviewRoutes.initRoutes(app);

  return app;
}
