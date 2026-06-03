import { FastifyInstance } from "fastify";

import { pdfProcessorRoutes } from "../../modules/document/http/routes/processor-pdf.routes";
import { elasticRoutes } from "../../modules/document/http/routes/search-pdf-terms.routes";

export const pdfRoutes = (app: FastifyInstance) => {
  app.register(pdfProcessorRoutes, { prefix: "/api" });
  app.register(elasticRoutes, { prefix: "/api" });
};
