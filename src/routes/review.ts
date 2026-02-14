import { diContainer } from "@fastify/awilix";
import { FastifyInstance } from "fastify";
import {
  reviewCreatePayloadSchema,
  reviewIdParamSchema,
  reviewUpdatePayloadSchema,
} from "@schemas/review.js";
import { ReviewCreatePayload, ReviewUpdatePayload } from "@models/review.js";
import { ReviewController } from "@controllers/review.js";
import { authenticateToken } from "@hooks/authenticateToken.js";

export interface ReviewRoutes {
  initRoutes(app: FastifyInstance): void;
}

export class DefaultReviewRoutes implements ReviewRoutes {
  private readonly controller: ReviewController;

  constructor() {
    this.controller = diContainer.resolve("reviewController");
  }

  initRoutes(app: FastifyInstance) {
    // Fetches one review by a given id after validating the query parameter
    app.get<{ Params: { reviewId: string } }>(
      "/api/reviews/:reviewId",
      {
        schema: {
          params: reviewIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.getOneReview(request, reply);
      },
    );

    // Fetches the current user reviews
    app.get(
      "/api/reviews/me",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
      },
      (request, reply) => {
        this.controller.getUserReviews(request, reply);
      },
    );

    // Inserts a review after validating the request body
    app.post<{ Body: ReviewCreatePayload }>(
      "/api/reviews/me",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          body: reviewCreatePayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.insertReview(request, reply);
      },
    );

    // Updates an existing review after validating the query parameter and request body
    app.put<{ Params: { reviewId: string }; Body: ReviewUpdatePayload }>(
      "/api/reviews/:reviewId/me",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: reviewIdParamSchema,
          body: reviewUpdatePayloadSchema,
        },
      },
      (request, reply) => {
        this.controller.updateReview(request, reply);
      },
    );

    // Deletes an existing review after validating the query parameter
    app.delete<{ Params: { reviewId: string } }>(
      "/api/reviews/:reviewId/me",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: reviewIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.deleteReview(request, reply);
      },
    );

    // Inserts a like for a review after validating the query parameter
    app.post<{ Params: { reviewId: string } }>(
      "/api/reviews/:reviewId/like",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: reviewIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.insertReviewLike(request, reply);
      },
    );

    // Deletes an existing like for a review after validating the query parameter
    app.delete<{ Params: { reviewId: string } }>(
      "/api/reviews/:reviewId/like",
      {
        onRequest: (request, reply, done) =>
          authenticateToken(request, reply, done),
        schema: {
          params: reviewIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.deleteReviewLike(request, reply);
      },
    );
  }
}
