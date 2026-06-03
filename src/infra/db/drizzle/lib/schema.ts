import { bigint } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { varchar } from "drizzle-orm/pg-core";
import { pgTable, uuid } from "drizzle-orm/pg-core";

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

export type ProcessedFile = typeof processedFilesTable.$inferSelect;
export type NewProcessedFile = typeof processedFilesTable.$inferInsert;
export type PDFStatus = typeof statusEnum;
