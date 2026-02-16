import { TmdbMovieDetails, TmdbMoviePage } from "@models/movie.js";

export interface TmdbClient {
  // Returns a movie
  getMovie(tmdbMovieId: string): Promise<TmdbMovieDetails>;
  // Returns a movie page for popular movies
  getPopularMovies(): Promise<TmdbMoviePage>;
  // Returns a movie page for movies based on a search query
  getMovieSearch(query: string): Promise<TmdbMoviePage>;
}

export class DefaultTmdbClient implements TmdbClient {
  private readonly baseUrl: string;
  private readonly options: RequestInit;

  constructor() {
    this.baseUrl = "https://api.themoviedb.org/3";
    this.options = {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + process.env.TMDB_TOKEN,
      },
    };
  }

  async getMovie(tmdbMovieId: string) {
    return (await (
      await fetch(`${this.baseUrl}/movie/${tmdbMovieId}`, this.options)
    ).json()) as TmdbMovieDetails;
  }

  async getPopularMovies() {
    return (await (
      await fetch(`${this.baseUrl}/movie/popular`, this.options)
    ).json()) as TmdbMoviePage;
  }

  async getMovieSearch(query: string) {
    return (await (
      await fetch(
        `${this.baseUrl}/search/movie?query=${encodeURIComponent(query)}`,
        this.options,
      )
    ).json()) as TmdbMoviePage;
  }
}
