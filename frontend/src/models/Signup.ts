import { z } from "zod";

export const SignupRequestSchema = z.object({
    email: z.string().email("Debe ser un email válido"),
    username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres"),
    password: z.string().min(4, "La contraseña debe tener al menos 4 caracteres"),
    name: z.string().min(1, "El nombre es obligatorio"),
    lastname: z.string().min(1, "El apellido es obligatorio"),
    birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Formato de fecha inválido",
    }),
    gender: z.enum(["Male", "Female", "Other"]).default("Other"),
    photo: z.string().optional(),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;
