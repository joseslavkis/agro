import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.string().email("Debe ser un email válido"),
  password: z.string().min(1, "La contraseña no puede estar vacía"),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().nullable(),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
