import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

import { ElasticSearchService } from "../../../../infra/services/elasticsearch.service";

export const elasticRoutes = (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: "GET",
    url: "/search",
    schema: {
      querystring: z.object({
        q: z.string().min(1, {
          error: "Type something to search!",
        }),
      }),
    },
    handler: async (request, reply) => {
      const { q } = request.query;
      const elasticService = ElasticSearchService.getInstance();

      const result = await elasticService.client.search({
        index: "documents",
        body: {
          query: {
            match: {
              content: {
                query: q,
                fuzziness: "AUTO",
              },
            },
          },
          highlight: {
            fields: {
              content: {},
            },
            pre_tags: ["<mark class='bg-yellow-200 dynamic-highlight'>"],
            post_tags: ["</mark>"],
            fragment_size: 150,
            number_of_fragments: 3,
          },
        },
      });

      const hits = result.hits.hits.map((hit) => ({
        id: hit._id,
        score: hit._score,
        snippets: hit.highlight?.content || [
          "Correspondência encontrada no documento.",
        ],
      }));

      return reply.status(200).send({
        results: hits,
      });
    },
  });
};
