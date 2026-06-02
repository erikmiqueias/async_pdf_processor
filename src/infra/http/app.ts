import fastify from "fastify";

import { setFastifyConfig } from "./config";

const buildApp = async () => {
  const app = fastify({
    logger: true,
  });
  await setFastifyConfig(app);

  return app;
};

export const startServer = async () => {
  const app = await buildApp();
  const port = process.env.PORT || 3000;

  app.listen({ port: Number(port) }, (err) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
  });
};

startServer();
