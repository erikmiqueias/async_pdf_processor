import * as amqp from "amqplib";

export class PdfProcessorWorker {
  private readonly queueName = "pdf_processing_queue";

  public async start() {
    try {
      const amqpUrl = process.env.RABBITMQ_URL;

      const connection = await amqp.connect(amqpUrl!);
      const channel = await connection.createChannel();

      await channel.assertQueue(this.queueName, { durable: true });
      await channel.prefetch(1);

      console.log("👷 [Worker]: Waiting jobs in the queue:", this.queueName);

      channel.consume(
        this.queueName,
        async (msg) => {
          if (!msg) return;

          try {
            const payload = JSON.parse(msg.content.toString());
            console.log(
              "\n📥 [Worker]: Starting document OCR:",
              payload.documentId,
            );

            console.log(
              "✅ [Worker]: OCR finished successfully",
              payload.documentId,
            );

            channel.ack(msg);
          } catch (error) {
            console.log("❌ [Worker]: Failed to file process:", error);
            channel.nack(msg, false, false);
          }
        },
        { noAck: false },
      );
    } catch (error) {
      console.error("🔥 [Worker]: Fatal error to the starting process:", error);
      process.exit(1);
    }
  }
}
