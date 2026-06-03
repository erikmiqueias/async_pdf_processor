import { Upload } from "@aws-sdk/lib-storage";
import { randomUUID } from "crypto";
import { Readable } from "stream";

import { s3Client } from "../../../shared/lib/s3";
import { OutputS3ServiceDTO, StorageService } from "./s3-service.interface";

export class S3StorageService implements StorageService {
  async uploadFile(
    fileStream: Readable,
    mimeType: string,
    fileName: string,
  ): Promise<OutputS3ServiceDTO> {
    let sizeBytes = 0;
    const s3Key = `uploads/${randomUUID()}-${fileName}`;

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: "uploads",
        Key: s3Key,
        Body: fileStream,
        ContentType: mimeType,
      },
      queueSize: 4,
      partSize: 5 * 1024 * 1024,
    });

    upload.on("httpUploadProgress", (progress) => {
      if (progress.loaded) {
        sizeBytes = progress.loaded;
      }
    });

    await upload.done();
    return {
      sizeBytes,
      s3Key,
    };
  }
}
