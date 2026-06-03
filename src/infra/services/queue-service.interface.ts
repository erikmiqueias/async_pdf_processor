export interface QueueService {
  connect(): Promise<void>;
  publishToWorker(payload: {
    documentId: string;
    s3Key: string;
  }): Promise<void>;
}
