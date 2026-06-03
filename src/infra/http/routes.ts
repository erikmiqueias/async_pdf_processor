import { FastifyInstance } from "fastify";

import { pdfProcessorRoutes } from "../../modules/document/http/routes/processor-pdf.routes";

export const pdfRoutes = (app: FastifyInstance) => {
  app.register(pdfProcessorRoutes, { prefix: "/api" });
};
