import { diContainer } from "@fastify/awilix";
import { Database } from "better-sqlite3";
import {
  reviewResponsePayload,
  ReviewCreatePayload,
  ReviewUpdatePayload,
} from "@models/review.js";

export interface ReviewRepository {
  // Returns one review
  findOneReview(reviewId: string): reviewResponsePayload;
  // Returns the current user reviews
  findUserReviews(userId: string): Array<reviewResponsePayload>;
  // Inserts an review and returns the id
  insertReview(userId: string, payload: ReviewCreatePayload): number | bigint;
  // Updates an existing review and returns affected rows
  updateReview(reviewId: string, payload: ReviewUpdatePayload): number;
  // Deletes an review and returns affected rows
  deleteReview(reviewId: string): number;
  // Inserts a like for a review and does nothing if it already exists
  insertReviewLike(reviewId: string, userId: string): void;
  // Deletes a a like for a review and does nothing if it does not exist
  deleteReviewLike(reviewId: string, userId: string): void;
}

export class SQLiteReviewRepository implements ReviewRepository {
  private readonly db: Database;

  constructor() {
    this.db = diContainer.resolve("db");
  }

  findOneReview(reviewId: string) {
    return this.db
      .prepare(
        `select r.id, r.user_id as userId, r.tmdb_movie_id as tmdbMovieId, r.title, r.review_text as reviewText, r.rating, r.created_at as createdAt, u.username,
        (select count(*) from review_like as rl where rl.review_id = r.id) as likes
        from review r
        join user as u on u.id = r.user_id
        where r.id = @reviewId
        `,
      )
      .get({ reviewId }) as reviewResponsePayload;
  }

  findUserReviews(userId: string) {
    return this.db
      .prepare(
        `select r.id, r.user_id as userId, r.tmdb_movie_id as tmdbMovieId, r.title, r.review_text as reviewText, r.rating, r.created_at as createdAt, u.username, 
        (select count(*) from review_like as rl where rl.review_id = r.id) as likes
        from review r
        join user as u on u.id = r.user_id
        where r.user_id = @userId
        order by r.id ASC`,
      )
      .all({ userId }) as Array<reviewResponsePayload>;
  }

  insertReview(userId: string, payload: ReviewCreatePayload) {
    return this.db
      .prepare(
        `insert into review(user_id, tmdb_movie_id, title, review_text, rating)
        values(@userId, @tmdbMovieId, @title, @reviewText, @rating)`,
      )
      .run({ userId, ...payload }).lastInsertRowid;
  }

  updateReview(reviewId: string, payload: ReviewUpdatePayload) {
    return this.db
      .prepare(
        `update review
           set title = @title,
               review_text = @reviewText,
               rating = @rating
            where id = @reviewId`,
      )
      .run({ reviewId, ...payload }).changes;
  }

  deleteReview(reviewId: string) {
    return this.db
      .prepare(`delete from review where id = @reviewId`)
      .run({ reviewId }).changes;
  }

  insertReviewLike(reviewId: string, userId: string) {
    this.db
      .prepare(
        `insert or ignore into review_like(user_id, review_id)
        values(@userId, @reviewId)`,
      )
      .run({ userId, reviewId });
  }

  deleteReviewLike(reviewId: string, userId: string) {
    this.db
      .prepare(
        `delete from review_like where review_id = @reviewId and user_id = @userId`,
      )
      .run({ reviewId, userId });
  }
}
