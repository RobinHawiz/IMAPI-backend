import { diContainer } from "@fastify/awilix";
import {
  MovieReviewResponsePayload,
  ReviewCreatePayload,
  ReviewResponsePayload,
  ReviewUpdatePayload,
} from "@models/review.js";
import { DomainError } from "@errors/domainError.js";
import { ReviewRepository } from "@repositories/review.js";

export interface ReviewService {
  // Returns the reviews for a movie
  getMovieReviews(
    tmdbMovieId: string,
    userId: string,
  ): Array<MovieReviewResponsePayload>;
  // Returns one review or throws DomainError("Review not found")
  getOneReview(reviewId: string): ReviewResponsePayload;
  // Returns the current user reviews or throws DomainError("Reviews not found")
  getUserReviews(userId: string): Array<ReviewResponsePayload>;
  // Inserts and returns a new id
  insertReview(userId: string, payload: ReviewCreatePayload): number | bigint;
  // Updates if exists. Otherwise throws DomainError("Review not found")
  updateReview(reviewId: string, payload: ReviewUpdatePayload): void;
  // Deletes if exists. Otherwise throws DomainError("Review not found")
  deleteReview(reviewId: string): void;
  // Inserts a like for a review
  insertReviewLike(reviewId: string, userId: string): void;
  // Deletes a like for a review if it exists
  deleteReviewLike(reviewId: string, userId: string): void;
}

export class DefaultReviewService implements ReviewService {
  private readonly repo: ReviewRepository;

  constructor() {
    this.repo = diContainer.resolve("reviewRepo");
  }

  getMovieReviews(tmdbMovieId: string, userId: string) {
    return this.repo.findMovieReviews(tmdbMovieId, userId);
  }

  getOneReview(reviewId: string) {
    const review = this.repo.findOneReview(reviewId);
    if (!review) {
      throw new DomainError(`Review not found`);
    }
    return review;
  }

  getUserReviews(userId: string) {
    const reviews = this.repo.findUserReviews(userId);
    if (!reviews) {
      throw new DomainError(`Reviews not found`);
    }
    return reviews;
  }

  insertReview(userId: string, payload: ReviewCreatePayload) {
    return this.repo.insertReview(userId, payload);
  }

  updateReview(reviewId: string, payload: ReviewUpdatePayload) {
    const changes = this.repo.updateReview(reviewId, payload);
    if (changes === 0) {
      throw new DomainError(`Review not found`);
    }
  }

  deleteReview(reviewId: string) {
    const changes = this.repo.deleteReview(reviewId);
    if (changes === 0) {
      throw new DomainError(`Review not found`);
    }
  }

  insertReviewLike(reviewId: string, userId: string) {
    this.repo.insertReviewLike(reviewId, userId);
  }

  deleteReviewLike(reviewId: string, userId: string) {
    this.repo.deleteReviewLike(reviewId, userId);
  }
}
