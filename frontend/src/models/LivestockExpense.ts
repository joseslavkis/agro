import { z } from "zod";

export const LivestockExpenseCreateSchema = z.object({
    name: z.string().min(1, "El nombre es requerido"),
    fieldId: z.number().optional().nullable(),
    cost: z.number().positive("El costo debe ser positivo"),
    currency: z.enum(['USD', 'ARS']).optional(),
    exchangeRate: z.number().optional().nullable(),
    note: z.string().optional().nullable(),
    date: z.string(), // ISO Date
});

export type LivestockExpenseCreate = z.infer<typeof LivestockExpenseCreateSchema>;

export const LivestockExpenseResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    fieldId: z.number().nullable(),
    fieldName: z.string().nullable(),
    cost: z.number(),
    currency: z.string(),
    exchangeRate: z.number().nullable(),
    costUSD: z.number().nullable(),
    note: z.string().nullable(),
    date: z.string(),
    agendaEventId: z.number().nullable(),
});

export type LivestockExpenseResponse = z.infer<typeof LivestockExpenseResponseSchema>;
