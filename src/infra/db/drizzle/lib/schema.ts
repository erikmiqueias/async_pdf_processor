import { bigint } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import z from "zod";

export const statusEnum = pgEnum("processed_file_status", [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
]);

export const processedFilesTable = pgTable("processed_files", {
  id: uuid("id").primaryKey().defaultRandom(),
  originalFileName: varchar("original_file_name", { length: 255 }).notNull(),
  s3Key: varchar("s3_key", { length: 255 }).notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
  status: statusEnum("status").default("PENDING").notNull(),
  errorMessage: varchar("error_message", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const selectFileSchema = createSelectSchema(processedFilesTable);
export const insertFileSchema = createSelectSchema(processedFilesTable);

export type ProcessedFile = z.infer<typeof selectFileSchema>;
export type NewProcessedFile = z.infer<typeof insertFileSchema>;
export type PDFStatus = typeof statusEnum;
