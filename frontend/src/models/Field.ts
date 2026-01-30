import { z } from "zod";

export const FieldSchema = z.object({
    id: z.number(),
    name: z.string(),
    hectares: z.number(),
    photo: z.string().nullable().optional(),
    hasAgriculture: z.boolean().nullable().optional(),
    hasLivestock: z.boolean().nullable().optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
    cows: z.number().nullable().optional(),
    bulls: z.number().nullable().optional(),
    steers: z.number().nullable().optional(),
    youngSteers: z.number().nullable().optional(),
    heifers: z.number().nullable().optional(),
    maleCalves: z.number().nullable().optional(),
    femaleCalves: z.number().nullable().optional(),
});

export type Field = z.infer<typeof FieldSchema>;

export const CreateFieldSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    hectares: z.number().min(0.1, "Debe tener al menos 0.1 hectáreas"),
    photo: z.string().optional(),
    hasAgriculture: z.boolean().optional(),
    hasLivestock: z.boolean().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    cows: z.number().optional(),
    bulls: z.number().optional(),
    steers: z.number().optional(),
    youngSteers: z.number().optional(),
    heifers: z.number().optional(),
    maleCalves: z.number().optional(),
    femaleCalves: z.number().optional(),
});

export type CreateFieldRequest = z.infer<typeof CreateFieldSchema>;
