import { Readable } from "node:stream";

export interface OutputS3ServiceDTO {
  sizeBytes: number;
  s3Key: string;
}

export interface StorageService {
  uploadFile(
    fileStream: Readable,
    mimeType: string,
    fileName: string,
  ): Promise<OutputS3ServiceDTO>;
}
