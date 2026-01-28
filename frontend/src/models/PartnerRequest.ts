import { z } from "zod";

export const PartnerRequestSchema = z.object({
    id: z.number(),
    senderId: z.number(),
    senderName: z.string(),
    senderUsername: z.string(),
    senderPhoto: z.string(),
    status: z.string(),
    createdAt: z.string().optional(),
});

export type PartnerRequest = z.infer<typeof PartnerRequestSchema>;
