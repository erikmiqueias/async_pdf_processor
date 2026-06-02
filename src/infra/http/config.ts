import cors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyWebSocket from "@fastify/websocket";
import fastifyApiReference from "@scalar/fastify-api-reference";
import { FastifyInstance } from "fastify/types/instance";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

export function setFastifyConfig(app: FastifyInstance) {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(fastifyWebSocket);
  app.register(cors, {
    origin: ["http://localhost:5173"],
  });

  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Async PDF Processor API",
        description: "API documentation for the Async PDF Processor",
        version: "1.0.0",
      },
      servers: [
        {
          description: "Development server",
          url: `http://localhost:${process.env.PORT || 3000}`,
        },
      ],
    },
    transform: jsonSchemaTransform,
  });

  app.register(fastifyApiReference, {
    routePrefix: "/docs",
    openApiDocumentEndpoints: {
      json: "/docs.json",
      yaml: "/docs.yaml",
    },
  });
}
