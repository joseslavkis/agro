import { z } from "zod";

export const UserProfileSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    lastname: z.string(),
    photo: z.string(),
    gender: z.string(),
    birthDate: z.string(),
    username: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;
