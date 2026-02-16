import { diContainer } from "@fastify/awilix";
import { FastifyInstance } from "fastify";
import { tmdbMovieIdParamSchema } from "@schemas/review.js";
import { MovieController } from "@controllers/movie.js";

export interface MovieRoutes {
  initRoutes(app: FastifyInstance): void;
}

export class DefaultMovieRoutes implements MovieRoutes {
  private readonly controller: MovieController;

  constructor() {
    this.controller = diContainer.resolve("movieController");
  }

  initRoutes(app: FastifyInstance) {
    // Fetches a specific movie
    app.get<{ Params: { tmdbMovieId: string } }>(
      "/api/movies/:tmdbMovieId",
      {
        schema: {
          params: tmdbMovieIdParamSchema,
        },
      },
      (request, reply) => {
        this.controller.getMovie(request, reply);
      },
    );

    // Fetches popular movies
    app.get("/api/movies/popular", (_, reply) => {
      this.controller.getPopularMovies(reply);
    });

    // Fetches movies based on query
    app.get<{ Querystring: { query: string } }>(
      "/api/movies/search",
      (request, reply) => {
        this.controller.getMovieSearch(request, reply);
      },
    );
  }
}
