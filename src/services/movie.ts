import { diContainer } from "@fastify/awilix";
import { DomainError } from "@errors/domainError.js";
import { ReviewRepository } from "@repositories/review.js";
import { TmdbClient } from "@repositories/movie.js";
import {
  MovieDetailsResponse,
  MoviePageResponse,
  MoviePageResultResponse,
  MovieRatingStats,
  TmdbMovieDetails,
  TmdbMoviePage,
} from "@models/movie.js";

export interface MovieService {
  // Returns one movie or throws a DomainError
  getMovie(tmdbMovieId: string): Promise<MovieDetailsResponse>;
  // Returns a movie page for popular movies or throws a DomainError
  getPopularMovies(): Promise<MoviePageResponse>;
  // Returns a movie page for movies based on a search query. If the query does not exist it will return a page for popular movies instead. Will throw a DomainError on any errors that might occur.
  getMovieSearch(query: string): Promise<MoviePageResponse>;
}

export class DefaultMovieService implements MovieService {
  private readonly repo: ReviewRepository;
  private readonly client: TmdbClient;
  private readonly baseImageUrl: string;

  constructor() {
    this.repo = diContainer.resolve("reviewRepo");
    this.client = diContainer.resolve("tmdbClient");
    this.baseImageUrl = "https://image.tmdb.org/t/p";
  }

  async getMovie(tmdbMovieId: string) {
    try {
      const movie = await this.client.getMovie(tmdbMovieId);
      const movieStats = this.repo.findMovieReviewStats(tmdbMovieId);
      const response = this.mapTmdbMovieDetails(movie, movieStats);
      return response;
    } catch (error) {
      const errorMessage = `Tmdb client error: ${error instanceof Error ? error.message : error}`;
      console.log(errorMessage);
      throw new DomainError(errorMessage);
    }
  }

  async getPopularMovies() {
    try {
      const tmdbMoviePage = await this.client.getPopularMovies();
      const response = this.mapTmdbMoviePage(tmdbMoviePage);
      return response;
    } catch (error) {
      const errorMessage = `Tmdb client error: ${error instanceof Error ? error.message : error}`;
      console.log(errorMessage);
      throw new DomainError(errorMessage);
    }
  }

  async getMovieSearch(query: string) {
    try {
      const tmdbMoviePage = await this.client.getMovieSearch(query);
      const response = this.mapTmdbMoviePage(tmdbMoviePage);
      return response;
    } catch (error) {
      const errorMessage = `Tmdb client error: ${error instanceof Error ? error.message : error}`;
      console.log(errorMessage);
      throw new DomainError(errorMessage);
    }
  }

  private mapTmdbMovieDetails(
    movie: TmdbMovieDetails,
    movieStats: MovieRatingStats,
  ) {
    const response: MovieDetailsResponse = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      runtime: movie.runtime,
      // remove genre id's that come from TMDb v3
      genres: movie.genres.map((genre) => genre.name),
      posterPath: movie.poster_path
        ? `${this.baseImageUrl}/w780${movie.poster_path}`
        : null,
      backdropPath: movie.backdrop_path
        ? `${this.baseImageUrl}/original${movie.backdrop_path}`
        : null,
      averageRating: movieStats.averageRating,
      reviewCount: movieStats.reviewCount,
    };
    return response;
  }

  private mapTmdbMoviePage(tmdbMoviePage: TmdbMoviePage) {
    const results = tmdbMoviePage.results.map<MoviePageResultResponse>(
      (movie) => ({
        id: movie.id,
        title: movie.title,
        releaseDate: movie.release_date,
        posterPath: movie.poster_path
          ? `${this.baseImageUrl}/w500${movie.poster_path}`
          : null,
      }),
    );
    const response: MoviePageResponse = {
      page: tmdbMoviePage.page,
      results,
      totalPages: tmdbMoviePage.total_pages,
      totalResults: tmdbMoviePage.total_results,
    };
    return response;
  }
}
