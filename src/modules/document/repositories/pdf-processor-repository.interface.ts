import { ProcessedFile } from "../../../infra/db/drizzle/lib/schema";
import { CreateDocumentDTO } from "../http/dtos/pdf-processor.dtos";

export interface PdfProcessorRepository {
  createDocument(
    inputFile: Pick<
      CreateDocumentDTO,
      "originalFileName" & "sizeBytes" & "s3Key"
    >,
  ): Promise<ProcessedFile>;
}
