import { z } from "zod";

export const RainfallRecordSchema = z.object({
    id: z.number(),
    fieldId: z.number(),
    date: z.string(),
    amountMm: z.number(),
});

export type RainfallRecord = z.infer<typeof RainfallRecordSchema>;
