import { z } from "zod";

export enum LivestockActionType {
    BIRTH = "BIRTH",
    DEATH = "DEATH",
    MOVE = "MOVE",
    SALE = "SALE",
    PURCHASE = "PURCHASE"
}

export enum LivestockCategory {
    COWS = "COWS",
    BULLS = "BULLS",
    STEERS = "STEERS",
    YOUNG_STEERS = "YOUNG_STEERS",
    HEIFERS = "HEIFERS",
    MALE_CALVES = "MALE_CALVES",
    FEMALE_CALVES = "FEMALE_CALVES"
}

export const LivestockTransactionCreateSchema = z.object({
    actionType: z.nativeEnum(LivestockActionType),
    category: z.nativeEnum(LivestockCategory),
    quantity: z.number().int().positive(),
    sourceFieldId: z.number().optional().nullable(),
    targetFieldId: z.number().optional().nullable(),
    date: z.string(), // ISO Date
    notes: z.string().optional()
});

export type LivestockTransactionCreate = z.infer<typeof LivestockTransactionCreateSchema>;

export const LivestockTransactionResponseSchema = z.object({
    id: z.number(),
    actionType: z.nativeEnum(LivestockActionType),
    category: z.nativeEnum(LivestockCategory),
    quantity: z.number(),
    sourceFieldId: z.number().nullable(),
    sourceFieldName: z.string().nullable(),
    targetFieldId: z.number().nullable(),
    targetFieldName: z.string().nullable(),
    date: z.string(),
    notes: z.string().nullable()
});

export type LivestockTransactionResponse = z.infer<typeof LivestockTransactionResponseSchema>;

export const CategoryLabels: Record<LivestockCategory, string> = {
    [LivestockCategory.COWS]: "Vacas",
    [LivestockCategory.BULLS]: "Toros",
    [LivestockCategory.STEERS]: "Novillos",
    [LivestockCategory.YOUNG_STEERS]: "Novillitos",
    [LivestockCategory.HEIFERS]: "Vaquillonas",
    [LivestockCategory.MALE_CALVES]: "Terneros",
    [LivestockCategory.FEMALE_CALVES]: "Terneras",
};

export const ActionLabels: Record<LivestockActionType, string> = {
    [LivestockActionType.BIRTH]: "Nacimiento",
    [LivestockActionType.DEATH]: "Mortandad",
    [LivestockActionType.MOVE]: "Movimiento",
    [LivestockActionType.SALE]: "Venta",
    [LivestockActionType.PURCHASE]: "Compra",
};
