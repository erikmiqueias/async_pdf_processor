import { ProcessedFile } from "../../../infra/db/drizzle/lib/schema";
import { CreateDocumentDTO } from "../http/dtos/pdf-processor.dtos";

export interface PdfProcessorRepository {
  createDocument(inputFile: CreateDocumentDTO): Promise<ProcessedFile>;
}
