import { Client } from "@elastic/elasticsearch";

export class ElasticSearchService {
  private static instance: ElasticSearchService;
  public readonly client: Client;
  private readonly indexName = "documents";

  private constructor() {
    this.client = new Client({
      node: process.env.ELASTIC_URL,
    });
  }

  public static getInstance(): ElasticSearchService {
    if (!ElasticSearchService.instance) {
      ElasticSearchService.instance = new ElasticSearchService();
    }
    return ElasticSearchService.instance;
  }

  public async setupIndex() {
    const indexExists = await this.client.indices.exists({
      index: this.indexName,
    });

    if (!indexExists) {
      await this.client.indices.create({
        index: this.indexName,
        mappings: {
          properties: {
            documentId: { type: "keyword" },
            content: {
              type: "text",
              analyzer: "brazilian",
            },
            createdAt: { type: "date" },
          },
        },
      });
    }
  }

  public async indexDocument(documentId: string, text: string) {
    await this.client.index({
      index: this.indexName,
      id: documentId,
      body: {
        documentId,
        content: text,
        createdAt: new Date().toISOString(),
      },
    });

    await this.client.indices.refresh({ index: this.indexName });
  }
}
