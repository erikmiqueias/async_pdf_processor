import fastify from "fastify";

import { RabbitQueueService } from "../services/queue-service.service";
import { PdfProcessorWorker } from "../workers/pdf-processor.worker";
import { setFastifyConfig } from "./config";
import { pdfRoutes } from "./routes";

const buildApp = async () => {
  const app = fastify({
    logger: true,
  });
  await setFastifyConfig(app);
  pdfRoutes(app);

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
RabbitQueueService.getInstance().connect();
const pdfProcessWorker = new PdfProcessorWorker();
pdfProcessWorker.start();
