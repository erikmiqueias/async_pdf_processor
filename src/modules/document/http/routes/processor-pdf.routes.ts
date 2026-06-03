import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { selectFileSchema } from "../../../../infra/db/drizzle/lib/schema";
import { DrizzlePdfProcessorRepository } from "../../repositories/drizzle-pdf-processor-repository";
import { RabbitQueueService } from "../../services/queue-service.service";
import { S3StorageService } from "../../services/s3.service";
import { PdfProcessorUseCase } from "../../use-cases/pdf-processor.use-case";

export const pdfProcessorRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "POST",
    url: "/upload",
    schema: {
      consumes: ["multipart/form-data"],
      response: {
        202: z.object({
          message: z.string(),
          documentId: selectFileSchema.shape.id,
          status: selectFileSchema.shape.status,
        }),
        400: z.object({
          error: z.string(),
        }),
        500: z.object({
          error: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      if (!request.isMultipart()) {
        return reply
          .status(400)
          .send({ error: "Request must be multipart/form-data" });
      }

      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      const s3StorageService = new S3StorageService();
      const pdfProcessorRepository = new DrizzlePdfProcessorRepository();
      const rabbitQueueService = RabbitQueueService.getInstance();
      const pdfProcessorUseCase = new PdfProcessorUseCase(
        s3StorageService,
        pdfProcessorRepository,
        rabbitQueueService,
      );

      try {
        const upload = await pdfProcessorUseCase.processPDF(
          data.file,
          data.mimetype,
          data.filename,
        );

        return reply.status(202).send({
          message: "Pdf processor initialiazing...",
          documentId: upload.id,
          status: upload.status,
        });
      } catch (error) {
        return reply.status(500).send({
          error: `${error}`,
        });
      }
    },
  });
};
