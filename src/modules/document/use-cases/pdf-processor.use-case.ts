import { Readable } from "stream";

import { PdfProcessorRepository } from "../repositories/pdf-processor-repository.interface";
import { S3StorageService } from "../services/s3.service";

export class PdfProcessorUseCase {
  constructor(
    private readonly s3StorageService: S3StorageService,
    private readonly pdfProcessorRepository: PdfProcessorRepository,
  ) {}

  async processPDF(fileStream: Readable, mimeType: string, fileName: string) {
    const s3Upload = await this.s3StorageService.uploadFile(
      fileStream,
      mimeType,
      fileName,
    );
    const document = await this.pdfProcessorRepository.createDocument({
      originalFileName: fileName,
      s3Key: s3Upload.s3Key,
      sizeBytes: s3Upload.sizeBytes,
    });

    if (!document) {
      throw new Error("Failed to create document record");
    }

    return {
      ...document,
      id: document.id,
    };
  }
}
