import build from "./app.js";

const server = await build();

// Starts the server
try {
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await server.listen({
    port: port,
    host: "0.0.0.0",
  });
} catch (err) {
  server.log.error(err);
  process.exit(1);
}
