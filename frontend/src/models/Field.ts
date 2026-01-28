import { z } from "zod";

export const FieldSchema = z.object({
    id: z.number(),
    name: z.string(),
    hectares: z.number(),
    photo: z.string().nullable().optional(),
});

export type Field = z.infer<typeof FieldSchema>;

export const CreateFieldSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    hectares: z.number().min(0.1, "Debe tener al menos 0.1 hectáreas"),
    photo: z.string().optional(),
});

export type CreateFieldRequest = z.infer<typeof CreateFieldSchema>;
