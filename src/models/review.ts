// Represents a single item entry stored in the database
export type ReviewEntity = {
  id: string;
  userId: string;
  tmdbMovieId: string;
  tmdbMovieTitle: string;
  title: string;
  reviewText: string;
  rating: number;
  createdAt: string;
};

export type ReviewResponsePayload = ReviewEntity & {
  username: string;
  likes: number;
};

export type MovieReviewResponsePayload = ReviewResponsePayload & {
  likedByMe: 0 | 1;
};

export type ReviewCreatePayload = Omit<
  ReviewEntity,
  "id" | "userId" | "createdAt"
>;

export type ReviewUpdatePayload = Omit<
  ReviewEntity,
  "id" | "userId" | "tmdbMovieId" | "tmdbMovieTitle" | "createdAt"
>;
