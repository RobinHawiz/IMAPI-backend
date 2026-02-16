import { diContainer } from "@fastify/awilix";
import { FastifyReply, FastifyRequest } from "fastify";
import { DomainError } from "@errors/domainError.js";
import { MovieService } from "@services/movie.js";

export interface MovieController {
  /** GET /api/movies/:tmdbMovieId → 200, 400 bad request, 500 internal server error */
  getMovie(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  /** GET /api/movies/popular → 200, 400 bad request, 500 internal server error */
  getPopularMovies(reply: FastifyReply): Promise<void>;
  /** GET /api/movies/search → 200, 400 bad request, 500 internal server error */
  getMovieSearch(
    request: FastifyRequest<{ Querystring: { query: string } }>,
    reply: FastifyReply,
  ): Promise<void>;
}

export class DefaultMovieController implements MovieController {
  private readonly service: MovieService;

  constructor() {
    this.service = diContainer.resolve("movieService");
  }

  async getMovie(
    request: FastifyRequest<{ Params: { tmdbMovieId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { tmdbMovieId } = request.params;
      const movie = await this.service.getMovie(tmdbMovieId);
      reply.code(200).send(movie);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving movie data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving movie data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  async getPopularMovies(reply: FastifyReply) {
    try {
      const movies = await this.service.getPopularMovies();
      reply.code(200).send(movies);
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving popular movie data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving popular movie data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }

  async getMovieSearch(
    request: FastifyRequest<{ Querystring: { query: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const { query } = request.query;
      if (!query) {
        const movies = await this.service.getPopularMovies();
        reply.code(200).send(movies);
      } else {
        const movies = await this.service.getMovieSearch(query);
        reply.code(200).send(movies);
      }
    } catch (err) {
      if (err instanceof DomainError) {
        console.error("Error retrieving popular movie data:", err.message);
        reply.code(400).send({ message: err.message });
      } else {
        console.error("Error retrieving popular movie data:", err);
        reply.code(500).send({ ok: false });
      }
    }
  }
}
