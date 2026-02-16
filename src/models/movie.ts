// TMDb v3: GET /3/movie/{movie_id}
export type TmdbMovieDetails = {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  runtime: number; // minutes
  genres: Array<{
    name: string;
  }>;
  poster_path: string;
  backdrop_path: string;
};

// IMAPI API response for individual movies
export type MovieDetailsResponse = Omit<
  TmdbMovieDetails,
  "release_date" | "genres" | "poster_path" | "backdrop_path"
> & {
  releaseDate: string;
  genres: Array<string>;
  posterPath: string;
  backdropPath: string;
  averageRating: number | null;
  reviewCount: number;
};

// Movie statistics based on IMAPI reviews
export type MovieRatingStats = {
  reviewCount: number;
  averageRating: number | null;
};

/*
 * TMDb v3:
 * GET /3/movie/popular
 * GET /3/movie/search
 */
export type TmdbMoviePage = {
  page: number;
  results: Array<TmdbMoviePageResult>;
  total_pages: number;
  total_results: number;
};

// TMDb v3 response for movie page results (individual movies)
export type TmdbMoviePageResult = {
  id: number;
  title: string;
  release_date: string;
  poster_path: string;
};

// IMAPI API response for movie pages
export type MoviePageResponse = Omit<
  TmdbMoviePage,
  "results" | "total_pages" | "total_results"
> & {
  results: Array<MoviePageResultResponse>;
  totalPages: number;
  totalResults: number;
};

// IMAPI API response for movie page results (individual movies)
export type MoviePageResultResponse = Omit<
  TmdbMoviePageResult,
  "release_date" | "poster_path"
> & {
  releaseDate: string;
  posterPath: string;
};
