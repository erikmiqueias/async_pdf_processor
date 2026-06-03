import amqp, {
  type Channel,
  type ChannelModel,
  type Connection,
} from "amqplib";

import { QueueService } from "./queue-service.interface";

export class RabbitQueueService implements QueueService {
  private static instance: RabbitQueueService;
  private connection?: Connection;
  private channel?: Channel;
  private readonly queueName = "pdf_processing_queue";

  private constructor() {}

  public static getInstance(): RabbitQueueService {
    if (!RabbitQueueService.instance) {
      RabbitQueueService.instance = new RabbitQueueService();
    }
    return RabbitQueueService.instance;
  }

  public async connect() {
    if (this.connection && this.channel) return;

    try {
      const amqpUrl =
        process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

      this.connection = (await amqp.connect(amqpUrl)) as unknown as Connection;
      this.channel = await (
        this.connection as unknown as ChannelModel
      ).createChannel();

      await this.channel.assertQueue(this.queueName, { durable: true });
    } catch (error) {
      console.error("❌ [RabbitMQ] Connection failed:", error);
      throw error;
    }
  }

  public async publishToWorker(payload: { documentId: string; s3Key: string }) {
    if (!this.channel) {
      throw new Error("The RabbitMQ channel is not open.");
    }

    const messageBuffer = Buffer.from(JSON.stringify(payload));

    this.channel.sendToQueue(this.queueName, messageBuffer, {
      persistent: true,
    });

    console.log(`[RabbitMQ] Job publisher succesfully: ${payload.documentId}`);
  }
}
