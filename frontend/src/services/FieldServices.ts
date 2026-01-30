import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_API_URL } from "@/config/app-query-client";
import { useToken } from "@/services/TokenContext";
import { CreateFieldRequest, FieldSchema } from "@/models/Field";
import { z } from "zod";

export function useMyFields() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["fields"],
        queryFn: async () => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/fields`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching fields");
            }

            const data = await response.json();
            return z.array(FieldSchema).parse(data);
        },
        enabled: !!token,
    });
}

export function useField(id: number | null) {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["field", id],
        queryFn: async () => {
            if (!token || id === null) throw new Error("Not logged in or invalid id");
            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching field");
            }

            const data = await response.json();
            return FieldSchema.parse(data);
        },
        enabled: !!token && id !== null,
    });
}

export function useCreateField() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateFieldRequest & { imageFile?: File | null }) => {
            if (!token) throw new Error("Not logged in");

            const formData = new FormData();
            formData.append("field", new Blob([JSON.stringify({
                name: data.name,
                hectares: data.hectares,
                photo: data.photo,
                hasAgriculture: data.hasAgriculture,
                hasLivestock: data.hasLivestock,
                latitude: data.latitude,
                longitude: data.longitude,
                cows: data.cows,
                bulls: data.bulls,
                steers: data.steers,
                youngSteers: data.youngSteers,
                heifers: data.heifers,
                maleCalves: data.maleCalves,
                femaleCalves: data.femaleCalves,
            })], { type: "application/json" }));

            if (data.imageFile) {
                formData.append("image", data.imageFile);
            }

            const response = await fetch(`${BASE_API_URL}/api/v1/fields`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error creating field: ${response.status} ${text}`);
            }

            return FieldSchema.parse(await response.json());
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fields"] });
        },
    });
}

export function useDeleteField() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (fieldId: number) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${fieldId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error deleting field: ${response.status} ${text}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fields"] });
        },
    });
}

export function useUpdateField() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<CreateFieldRequest> }) => {
            if (!token) throw new Error("Not logged in");

            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${id}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error updating field: ${response.status} ${text}`);
            }

            return FieldSchema.parse(await response.json());
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["fields"] });
            queryClient.invalidateQueries({ queryKey: ["field", data.id] });
        },
    });
}

export const LivestockHistorySchema = z.object({
    date: z.string(),
    cows: z.number(),
    bulls: z.number(),
    steers: z.number(),
    youngSteers: z.number(),
    heifers: z.number(),
    maleCalves: z.number(),
    femaleCalves: z.number(),
});

export type LivestockHistory = z.infer<typeof LivestockHistorySchema>;

export function useLivestockHistory(fieldId: number | null) {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["livestockHistory", fieldId],
        queryFn: async () => {
            if (!token || fieldId === null) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/fields/${fieldId}/history`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching history");
            }

            const data = await response.json();
            return z.array(LivestockHistorySchema).parse(data);
        },
        enabled: !!token && fieldId !== null,
    });
}

export function useGlobalLivestockHistory() {
    const [tokenState] = useToken();
    const token = tokenState.state === "LOGGED_IN" ? tokenState.accessToken : null;

    return useQuery({
        queryKey: ["globalLivestockHistory"],
        queryFn: async () => {
            if (!token) throw new Error("Not logged in");
            const response = await fetch(`${BASE_API_URL}/api/v1/fields/history`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Error fetching global history");
            }

            const data = await response.json();
            return z.array(LivestockHistorySchema).parse(data);
        },
        enabled: !!token,
    });
}

