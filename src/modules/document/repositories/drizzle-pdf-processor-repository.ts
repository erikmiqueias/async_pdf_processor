import { db } from "../../../infra/db/drizzle/lib/config";
import {
  ProcessedFile,
  processedFilesTable,
} from "../../../infra/db/drizzle/lib/schema";
import { CreateDocumentDTO } from "../http/dtos/pdf-processor.dtos";
import { PdfProcessorRepository } from "./pdf-processor-repository.interface";

export class DrizzlePdfProcessorRepository implements PdfProcessorRepository {
  async createDocument(inputFile: CreateDocumentDTO): Promise<ProcessedFile> {
    const [newPdfFile] = await db
      .insert(processedFilesTable)
      .values(inputFile)
      .returning();
    return newPdfFile;
  }
}
