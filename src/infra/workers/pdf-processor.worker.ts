import { GetObjectCommand } from "@aws-sdk/client-s3";
import * as amqp from "amqplib";
import { eq } from "drizzle-orm";

import { s3Client } from "../../shared/lib/s3";
import { db } from "../db/drizzle/lib/config";
import { processedFilesTable } from "../db/drizzle/lib/schema";
import { ElasticSearchService } from "../services/elasticsearch.service";

export class PdfProcessorWorker {
  private readonly queueName = "pdf_processing_queue";

  public async start() {
    const elasticSearch = ElasticSearchService.getInstance();
    await elasticSearch.setupIndex();
    try {
      const amqpUrl = process.env.RABBITMQ_URL;
      const connection = await amqp.connect(amqpUrl!);
      const channel = await connection.createChannel();

      const dlxName = "pdf_processing_dlx";
      const routingKeyFail = "pdf_processing_fail";

      await channel.assertQueue(this.queueName, {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": dlxName,
          "x-dead-letter-routing-key": routingKeyFail,
        },
      });
      await channel.prefetch(1);

      channel.consume(
        this.queueName,
        async (msg) => {
          if (!msg) return;

          const payload = JSON.parse(msg.content.toString());

          try {
            const { Body } = await s3Client.send(
              new GetObjectCommand({
                Bucket: "uploads",
                Key: payload.s3Key,
              }),
            );

            const chunks = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for await (const chunk of Body as any) {
              chunks.push(chunk);
            }
            const fileBuffer = Buffer.concat(chunks);

            const base64Pdf = `data:application/pdf;base64,${fileBuffer.toString("base64")}`;

            const formData = new FormData();
            formData.append("base64Image", base64Pdf);
            formData.append("language", "por");
            formData.append("apikey", process.env.OCR_SPACE_API_KEY);
            formData.append("OCREngine", "2");

            const ocrResponse = await fetch(
              `https://api.ocr.space/parse/image`,
              {
                method: "POST",
                body: formData,
              },
            );

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ocrResult = (await ocrResponse.json()) as any;
            if (ocrResult.isErroredOnProcessing) {
              throw new Error("Error on OCR API", ocrResult.ErrorMessage);
            }

            const extractedTextArray = ocrResult.ParsedResults?.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (page: any) => page.ParsedText,
            );

            if (typeof extractedTextArray === "undefined") {
              throw new Error("Error to extracted text", payload.documentId);
            }

            const extractedText = extractedTextArray.join("\n\n");

            await db
              .update(processedFilesTable)
              .set({
                status: "COMPLETED",
                extractedText,
              })
              .where(eq(processedFilesTable.id, payload.documentId));

            await elasticSearch.indexDocument(
              payload.documentId,
              extractedText,
            );

            channel.ack(msg);
          } catch (error) {
            channel.nack(msg, false, false);
            await db
              .update(processedFilesTable)
              .set({
                status: "FAILED",
                errorMessage: String(error),
              })
              .where(eq(processedFilesTable.id, payload.documentId));
          }
        },
        { noAck: false },
      );
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
}
