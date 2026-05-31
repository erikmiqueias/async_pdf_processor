import fastify from "fastify";

const PORT = Number(process.env.PORT || 3000);
const app = fastify({
  logger: true,
});

app.get("/", async () => {
  return { message: "Hello, World!" };
});

app.listen({ port: PORT }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
