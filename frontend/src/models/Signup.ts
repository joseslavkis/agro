import { z } from "zod";

export const SignupRequestSchema = z.object({
    email: z.string().email("Must be a valid email"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    name: z.string().min(1, "Name is required"),
    lastname: z.string().min(1, "Last name is required"),
    birthDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date format",
    }),
    gender: z.enum(["Male", "Female", "Other"]).default("Other"),
    photo: z.string().optional(),
});

export type SignupRequest = z.infer<typeof SignupRequestSchema>;
