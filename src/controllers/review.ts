import { diContainer } from "@fastify/awilix";
import { FastifyReply, FastifyRequest } from "fastify";
import { ReviewCreatePayload, ReviewUpdatePayload } from "@models/review.js";
import { DomainError } from "@errors/domainError.js";
import { ReviewService } from "@services/review.js";
import { decodeTokenPayload } from "@utils/token.js";

export interface ReviewController {
  /** GET /api/reviews/:reviewId → 200, 400 bad request, 500 internal server error */
  getOneReview(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ): void;
  /** GET /api/reviews/me → 200, 400 bad request, 500 internal server error */
  getUserReviews(request: FastifyRequest, reply: FastifyReply): void;
  /** POST /api/reviews/me → 201, 400 bad request, 500 internal server error */
  insertReview(
    request: FastifyRequest<{ Body: ReviewCreatePayload }>,
    reply: FastifyReply,
  ): void;
  /** PUT /api/reviews/:reviewId/me → 204, 400 bad request, 500 internal server error */
  updateReview(
    request: FastifyRequest<{
      Params: { reviewId: string };
      Body: ReviewUpdatePayload;
    }>,
    reply: FastifyReply,
  ): void;
  /** DELETE /api/reviews/:reviewId/me → 204, 400 bad request, 500 internal server error */
  deleteReview(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ): void;
  /** POST /api/reviews/:reviewId/like → 201, 400 bad request, 500 internal server error */
  insertReviewLike(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ): void;
  /** DELETE /api/reviews/:reviewId/like → 204, 400 bad request, 500 internal server error */
  deleteReviewLike(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ): void;
}

export class DefaultReviewController implements ReviewController {
  private readonly service: ReviewService;

  constructor() {
    this.service = diContainer.resolve("reviewService");
  }

  getOneReview(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { reviewId } = request.params;
      const review = this.service.getOneReview(reviewId);
      reply.code(200).send(review);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving review data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving review data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  getUserReviews(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id: userId } = decodeTokenPayload<{ id: string }>(request);
      const reviews = this.service.getUserReviews(userId);
      reply.code(200).send(reviews);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving review data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving review data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  insertReview(
    request: FastifyRequest<{ Body: ReviewCreatePayload }>,
    reply: FastifyReply,
  ) {
    try {
      const { id: userId } = decodeTokenPayload<{ id: string }>(request);
      const reviewId = this.service.insertReview(userId, request.body);
      reply.code(201).header("Location", `/api/reviews/${reviewId}`).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error inserting review data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error inserting review data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  updateReview(
    request: FastifyRequest<{
      Params: { reviewId: string };
      Body: ReviewUpdatePayload;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { reviewId } = request.params;
      const payload = request.body;
      this.service.updateReview(reviewId, payload);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error updating review data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error updating review data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  deleteReview(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { reviewId } = request.params;
      this.service.deleteReview(reviewId);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error deleting review data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error deleting review data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  insertReviewLike(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id: userId } = decodeTokenPayload<{ id: string }>(request);
      const { reviewId } = request.params;
      this.service.insertReviewLike(reviewId, userId);
      reply.code(201).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error inserting review like data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error inserting review like data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  deleteReviewLike(
    request: FastifyRequest<{ Params: { reviewId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { id: userId } = decodeTokenPayload<{ id: string }>(request);
      const { reviewId } = request.params;
      this.service.deleteReviewLike(reviewId, userId);
      reply.code(204).send();
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error deleting review like data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error deleting review like data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }
}
