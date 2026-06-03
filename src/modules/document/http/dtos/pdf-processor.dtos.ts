import z from "zod";

import { NewProcessedFile } from "../../../../infra/db/drizzle/lib/schema";
export type CreateDocumentDTO = z.infer<NewProcessedFile>;
